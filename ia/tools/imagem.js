import {gerarComFallback, regraIdioma, blocoDados, REGRA_DADOS} from '../core/llm.js';
import {TTError} from '../util.js';
export const imagem={id:'imagem',nome:'Analisar imagem',descricao:'Descreva uma imagem ou peça para ler o texto visível.',ordem:60,limites:{min:1,max:1500}};
export async function executar({texto,imagem,settings,signal}){
 const {mimeType,data}=imagem||{};
 if(!['image/png','image/jpeg','image/webp'].includes(mimeType)||typeof data!=='string'||data.length>5592410||!data.length||!/^[A-Za-z0-9+/]+={0,2}$/.test(data))throw new TTError('GENERICO','Escolha uma imagem PNG, JPEG ou WebP de até 4 MiB.');
 return gerarComFallback({settings,signal,imagem:{mimeType,data},sistema:'Analise a imagem anexada. Descreva apenas o que estiver visível. Se transcrever, indique trechos ilegíveis. '+regraIdioma(settings)+' '+REGRA_DADOS,usuario:blocoDados('texto',texto)});
}
