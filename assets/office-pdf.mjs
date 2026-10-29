// Conversão básica e 100% local de conteúdo Office/TXT para PDF.
// Não tenta fingir que mantém fielmente paginação, fontes, gráficos ou layout.
import {PDFDocument,StandardFonts,rgb} from '../vendor/pdf-lib.esm.min.mjs';
const MAX_INPUT=20*1024*1024,MAX_XML=12*1024*1024,MAX_ZIP_ENTRIES=5000;
const decode=new TextDecoder('utf-8');
function zipReader(buffer){const bytes=new Uint8Array(buffer),v=new DataView(buffer);let tail=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){tail=i;break;}
 if(tail<0)throw Error('Esse arquivo não parece ser um documento Office válido.');
 const total=v.getUint16(tail+10,true),offset=v.getUint32(tail+16,true);if(total>MAX_ZIP_ENTRIES)throw Error('O documento tem conteúdo demais para esta versão.');
 const files=new Map();let pos=offset;
 for(let i=0;i<total;i++){
  if(pos+46>bytes.length||v.getUint32(pos,true)!==0x02014b50)throw Error('O documento parece estar danificado.');
  const method=v.getUint16(pos+10,true),flags=v.getUint16(pos+8,true),compressed=v.getUint32(pos+20,true),length=v.getUint32(pos+24,true),nameLength=v.getUint16(pos+28,true),extra=v.getUint16(pos+30,true),comment=v.getUint16(pos+32,true),local=v.getUint32(pos+42,true);
  const name=decode.decode(bytes.subarray(pos+46,pos+46+nameLength));files.set(name,{method,flags,compressed,length,local});pos+=46+nameLength+extra+comment;
 }
 return {has:name=>files.has(name),async text(name){const f=files.get(name);if(!f)return null;if(f.flags&1)throw Error('Arquivos Office com senha ainda não são aceitos.');if(f.length>MAX_XML||f.compressed>MAX_XML)throw Error('Parte do documento grande demais.');if(f.local+30>bytes.length||v.getUint32(f.local,true)!==0x04034b50)throw Error('Arquivo interno inválido.');
  const off=f.local+30+v.getUint16(f.local+26,true)+v.getUint16(f.local+28,true);if(off+f.compressed>bytes.length)throw Error('Documento incompleto.');let data=bytes.subarray(off,off+f.compressed);
  if(f.method===8){if(typeof DecompressionStream==='undefined')throw Error('Este navegador não oferece descompactação offline.');data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}
  else if(f.method!==0)throw Error('Compactação Office ainda não suportada.');if(data.length!==f.length||data.length>MAX_XML)throw Error('Documento inválido ou muito grande.');return decode.decode(data);
 }};
}
function xml(text){if(!text)throw Error('Não encontrei o conteúdo esperado dentro desse arquivo.');const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('Uma parte do documento está corrompida.');return doc;}
const ns=(node,name)=>Array.from(node.getElementsByTagName('*')).filter(n=>n.localName===name);
const directText=(node,tag)=>ns(node,tag).map(n=>n.textContent||'').join('');
function parseDocx(text){const root=xml(text);const body=ns(root,'body')[0];if(!body)throw Error('Documento Word sem corpo.');const lines=[];
 for(const item of body.children){if(item.localName==='p'){const txt=directText(item,'t');const style=ns(item,'pStyle')[0]?.getAttribute('w:val')||'';lines.push({text:txt||' ',heading:/Heading|Title|T.tulo/i.test(style)});}
 else if(item.localName==='tbl'){for(const row of Array.from(item.children).filter(x=>x.localName==='tr')){let cells=Array.from(row.children).filter(x=>x.localName==='tc').map(c=>directText(c,'t').trim());lines.push({text:cells.join('  |  ')||' ',table:true});}lines.push({text:' '});}}
 return lines;
}
function xlsxCellText(c,shared){const t=c.getAttribute('t'),v=ns(c,'v')[0]?.textContent||'';
 if(t==='s')return shared[Number(v)]||'';if(t==='inlineStr')return directText(c,'t');if(t==='b')return v==='1'?'VERDADEIRO':'FALSO';return v;
}
async function parseXlsx(zip){const sharedDoc=await zip.text('xl/sharedStrings.xml');const shared=sharedDoc?ns(xml(sharedDoc),'si').map(n=>directText(n,'t')):[];const wb=xml(await zip.text('xl/workbook.xml'));const sheets=ns(wb,'sheet').slice(0,30);const found=[];
 // XLSX básico: relaciona r:id a destinos; caminho padrão continua sendo planilhas sheetN.xml.
 const relText=await zip.text('xl/_rels/workbook.xml.rels');const rels=new Map();if(relText){for(const r of ns(xml(relText),'Relationship')){let target=r.getAttribute('Target')||'';target=target.startsWith('/')?target.slice(1):target.replace(/^\.\.\//,'');rels.set(r.getAttribute('Id'),target.startsWith('xl/')?target:'xl/'+target);}}
 for(let i=0;i<sheets.length;i++){const item=sheets[i],id=item.getAttribute('r:id')||item.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');const path=rels.get(id)||`xl/worksheets/sheet${i+1}.xml`;const source=await zip.text(path);if(!source)continue;const doc=xml(source),rows=[];
 for(const row of ns(doc,'row').slice(0,1200)){const cells=Array.from(row.children).filter(c=>c.localName==='c');if(cells.length){const values=cells.slice(0,25).map(c=>{const addr=c.getAttribute('r')||'';return `${addr||'Célula'}: ${xlsxCellText(c,shared)}`}).filter(v=>!v.endsWith(': '));if(values.length)rows.push({text:values.join('   ·   '),table:true});}}
 found.push({name:item.getAttribute('name')||`Planilha ${i+1}`,rows});}
 return found;
}
async function parsePptx(zip){const pres=await zip.text('ppt/presentation.xml');if(!pres)throw Error('Apresentação sem slides legíveis.');const slides=[];
 for(let i=1;i<=300;i++){const text=await zip.text(`ppt/slides/slide${i}.xml`);if(!text){if(i>1)break;continue;}const doc=xml(text),paragraphs=[];for(const p of ns(doc,'p')){const t=directText(p,'t');if(t.trim())paragraphs.push({text:t});}slides.push({name:`Slide ${i}`,rows:paragraphs});}
 return slides;
}
function replaceUnsupported(font,text){const arr=[];for(const c of String(text).normalize('NFC')){if(c==='\t'){arr.push('    ');continue;}if(c==='\n'){arr.push(' ');continue;}try{font.encodeText(c);arr.push(c)}catch{arr.push('?')}}return arr.join('');}
export async function convertOfficeToPdf(file,{pageSize='A4',title=''}={}){
 if(!file?.size||file.size>MAX_INPUT)throw Error('Escolha um arquivo com até 20 MB.');const ext=file.name.toLowerCase().split('.').pop();let sections=[];
 if(ext==='txt'){const text=await file.text();sections=[{name:title||file.name,rows:text.replace(/\r\n?/g,'\n').split('\n').slice(0,15000).map(t=>({text:t||' '}))}];}
 else{const zip=zipReader(await file.arrayBuffer());if(ext==='docx')sections=[{name:title||file.name,rows:parseDocx(await zip.text('word/document.xml'))}];else if(ext==='xlsx')sections=await parseXlsx(zip);else if(ext==='pptx')sections=await parsePptx(zip);else throw Error('Formato não compatível. Use TXT, DOCX, XLSX ou PPTX.');}
 if(!sections.length||!sections.some(s=>s.rows.length))throw Error('Não encontrei conteúdo textual para converter.');
 const pdf=await PDFDocument.create();const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const size=pageSize==='letter'?[612,792]:[595.28,841.89],margin=48;let page=null,y=0,added=0;
 const fresh=()=>{page=pdf.addPage(size);y=size[1]-margin;added++;page.drawLine({start:{x:margin,y:35},end:{x:size[0]-margin,y:35},thickness:.5,color:rgb(.77,.81,.86)});page.drawText(String(added),{x:size[0]-margin-15,y:22,font:regular,size:9,color:rgb(.42,.47,.54)});};
 const write=(text,{header=false,table=false}={})=>{let font=header?bold:regular,pt=header?15:table?9:10.5,pad=header?14:6,usable=size[0]-2*margin;let src=replaceUnsupported(font,text);if(!src)src=' ';
  const words=src.split(/\s+/),rows=[],current=[];for(const word of words){if(!word)continue;const candidate=[...current,word].join(' ');if(font.widthOfTextAtSize(candidate,pt)>usable&&current.length){rows.push(current.join(' '));current.length=0;}if(font.widthOfTextAtSize(word,pt)>usable){let fragment='';for(const char of word){if(font.widthOfTextAtSize(fragment+char,pt)>usable&&fragment){rows.push(fragment);fragment='';}fragment+=char;}if(fragment)current.push(fragment);}else current.push(word);if(rows.length>300)break;}if(current.length)rows.push(current.join(' '));if(!rows.length)rows.push(' ');
  for(const row of rows){if(!page||y<margin+pt+10)fresh();page.drawText(row,{x:margin,y,font,size:pt,color:rgb(.14,.18,.24)});y-=pt*1.45;}y-=pad;
 };
 for(const section of sections){if(!page||y<size[1]*.34)fresh();write(section.name,{header:true});for(const row of section.rows){write(row.text,{header:row.heading,table:row.table});if(added>500)throw Error('A conversão excedeu 500 páginas. Divida o documento.');}}
 return {bytes:await pdf.save({useObjectStreams:true}),pages:added,sections:sections.length};
}
