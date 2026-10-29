import {finalPhrases} from './final-locale.mjs';
import {releasePhrases} from './locale-v040.mjs';
import {catalogPhrases} from './catalog-phrases.mjs';
import {commonEnglish,additionalLanguages} from './locale-expansion.mjs';
/* Traduções da navegação principal. Offline; mantém o texto original se ainda não traduzido. */
export const LANGUAGES=[{id:'pt',name:'Português'},{id:'en',name:'English'},{id:'de',name:'Deutsch'},{id:'es',name:'Español'},{id:'fr',name:'Français'},{id:'it',name:'Italiano'},{id:'nl',name:'Nederlands'},{id:'ja',name:'日本語'},{id:'zh',name:'中文（简体）'},{id:'ru',name:'Русский'},{id:'ko',name:'한국어'},{id:'pl',name:'Polski'},{id:'esd',name:'Esdeliano'}];
export const languageCode=value=>{if(value==='auto'||!value)value=navigator.language;const raw=String(value).toLowerCase();const s=raw==='esd'?'esd':raw.startsWith('zh')?'zh':raw.startsWith('ja')?'ja':raw.slice(0,2);return LANGUAGES.some(x=>x.id===s)?s:'pt';};
// pt-BR → en / de / es / fr / it / nl
const P={
 'Início':['Home','Startseite','Inicio','Accueil','Home','Start'],
 'Ferramentas':['Tools','Werkzeuge','Herramientas','Outils','Strumenti','Hulpmiddelen'],
 'Todas as ferramentas':['All tools','Alle Werkzeuge','Todas las herramientas','Tous les outils','Tutti gli strumenti','Alle hulpmiddelen'],
 'Ver todas':['See all','Alle anzeigen','Ver todas','Tout voir','Mostra tutto','Alles bekijken'],
 'Favoritos':['Favorites','Favoriten','Favoritos','Favoris','Preferiti','Favorieten'],
 'Recentes':['Recent','Zuletzt verwendet','Recientes','Récents','Recenti','Recent'],
 'Módulos':['Modules','Module','Módulos','Modules','Moduli','Modules'],
 'Entretenimento':['Entertainment','Unterhaltung','Entretenimiento','Divertissement','Divertimento','Ontspanning'],
 'Texto':['Text','Text','Texto','Texte','Testo','Tekst'],
 'Imagens':['Images','Bilder','Imágenes','Images','Immagini','Afbeeldingen'],
 'Vídeo':['Video','Video','Vídeo','Vidéo','Video','Video'],
 'PDF':['PDF','PDF','PDF','PDF','PDF','PDF'],
 'Geradores':['Generators','Generatoren','Generadores','Générateurs','Generatori','Generators'],
 'Utilitários':['Utilities','Dienstprogramme','Utilidades','Utilitaires','Utilità','Hulpmiddelen'],
 'Jogos':['Games','Spiele','Juegos','Jeux','Giochi','Spellen'],
 'Sorteio':['Random draws','Auslosung','Sorteos','Tirages','Sorteggi','Loting'],
 'Configurações':['Settings','Einstellungen','Configuración','Paramètres','Impostazioni','Instellingen'],
 'Apoiar a Caixota':['Support Caixota','Caixota unterstützen','Apoyar Caixota','Soutenir Caixota','Sostieni Caixota','Steun Caixota'],
 'Perfil':['Profile','Profil','Perfil','Profil','Profilo','Profiel'],
 'Meu perfil':['My profile','Mein Profil','Mi perfil','Mon profil','Il mio profilo','Mijn profiel'],
 'Biblioteca':['Library','Bibliothek','Biblioteca','Bibliothèque','Biblioteca','Bibliotheek'],
 'BIBLIOTECA':['LIBRARY','BIBLIOTHEK','BIBLIOTECA','BIBLIOTHÈQUE','BIBLIOTECA','BIBLIOTHEEK'],
 'ESPAÇO DE TRABALHO':['WORKSPACE','ARBEITSBEREICH','ESPACIO DE TRABAJO','ESPACE DE TRAVAIL','AREA DI LAVORO','WERKRUIMTE'],
 'Busque qualquer ferramenta...':['Search any tool...','Werkzeug suchen...','Busca una herramienta...','Chercher un outil...','Cerca uno strumento...','Zoek een hulpmiddel...'],
 'Buscar no catálogo':['Search the catalog','Katalog durchsuchen','Buscar en el catálogo','Chercher dans le catalogue','Cerca nel catalogo','Zoek in catalogus'],
 'Pesquisar por nome, função ou palavra-chave...':['Search by name, function or keyword...','Nach Namen oder Stichwort suchen...','Buscar por nombre o palabra clave...','Chercher par nom ou mot-clé...','Cerca per nome o parola chiave...','Zoek op naam of trefwoord...'],
 'Buscar algo':['Search','Suchen','Buscar','Chercher','Cerca','Zoeken'],
 'Explorar ferramentas':['Explore tools','Werkzeuge entdecken','Explorar herramientas','Explorer les outils','Esplora strumenti','Ontdek tools'],
 'Ver catálogo completo':['See full catalog','Gesamten Katalog anzeigen','Ver catálogo completo','Voir tout le catalogue','Catalogo completo','Bekijk catalogus'],
 'Todas':['All','Alle','Todas','Toutes','Tutte','Alle'],
 'Offline':['Offline','Offline','Sin conexión','Hors ligne','Offline','Offline'],
 'Com internet':['Online','Online','Con internet','Avec internet','Con internet','Met internet'],
 'Internet':['Internet','Internet','Internet','Internet','Internet','Internet'],
 'Abrir ferramenta':['Open tool','Werkzeug öffnen','Abrir herramienta','Ouvrir l’outil','Apri strumento','Open hulpmiddel'],
 'Como usar':['How to use','So funktioniert es','Cómo usar','Comment utiliser','Come si usa','Hoe te gebruiken'],
 'Anterior':['Previous','Zurück','Anterior','Précédent','Precedente','Vorige'],
 'Voltar':['Back','Zurück','Volver','Retour','Indietro','Terug'],
 'Voltar para':['Back to','Zurück zu','Volver a','Retour à','Torna a','Terug naar'],
 'PAINEL':['PANEL','PANEL','PANEL','PANNEAU','PANNELLO','PANEEL'],
 'FERRAMENTA':['TOOL','WERKZEUG','HERRAMIENTA','OUTIL','STRUMENTO','HULPMIDDEL'],
 'FERRAMENTA LOCAL':['LOCAL TOOL','LOKALES WERKZEUG','HERRAMIENTA LOCAL','OUTIL LOCAL','STRUMENTO LOCALE','LOKAAL HULPMIDDEL'],
 'CARREGANDO FERRAMENTA':['LOADING TOOL','WERKZEUG WIRD GELADEN','CARGANDO HERRAMIENTA','CHARGEMENT','CARICAMENTO','LADEN'],
 'Seu espaço de ferramentas':['Your toolbox','Dein Werkzeugkasten','Tu caja de herramientas','Votre boîte à outils','La tua cassetta degli attrezzi','Jouw gereedschapskist'],
 'Bom ter você por aqui':['Nice to see you!','Schön, dass du da bist!','¡Qué bueno verte!','Ravi de te voir !','Che bello vederti!','Fijn dat je er bent!'],
 'O seu dia fica melhor':['Make your day easier','Mach deinen Tag leichter','Haz tu día más fácil','Simplifie ta journée','Rendi la giornata più facile','Maak je dag makkelijker'],
 'O que vamos fazer hoje?':['What shall we do today?','Was machen wir heute?','¿Qué hacemos hoy?','Que fait-on aujourd’hui ?','Che facciamo oggi?','Wat gaan we vandaag doen?'],
 'O que há na Caixota':['What’s new in Caixota','Neu in Caixota','Novedades de Caixota','Nouveautés de Caixota','Novità di Caixota','Nieuw in Caixota'],
 'INÍCIO':['HOME','START','INICIO','ACCUEIL','HOME','START'],
 'NOVIDADE':['NEW','NEU','NUEVO','NOUVEAU','NUOVO','NIEUW'],
 'Ferramentas reais':['Real tools','Echte Werkzeuge','Herramientas reales','Vrais outils','Strumenti reali','Echte hulpmiddelen'],
 'Editar perfil':['Edit profile','Profil bearbeiten','Editar perfil','Modifier le profil','Modifica profilo','Profiel bewerken'],
 'DO SEU JEITO':['YOUR WAY','DEIN STIL','A TU MANERA','À VOTRE FAÇON','A MODO TUO','OP JOUW MANIER'],
 'Aparência':['Appearance','Aussehen','Apariencia','Apparence','Aspetto','Uiterlijk'],
 'Desempenho':['Performance','Leistung','Rendimiento','Performances','Prestazioni','Prestaties'],
 'Comportamento':['Behavior','Verhalten','Comportamiento','Comportement','Comportamento','Gedrag'],
 'Idioma e região':['Language & region','Sprache & Region','Idioma y región','Langue et région','Lingua e regione','Taal en regio'],
 'Ferramentas e módulos':['Tools & modules','Werkzeuge & Module','Herramientas y módulos','Outils et modules','Strumenti e moduli','Hulpmiddelen en modules'],
 'Sugestões e feedback':['Suggestions & feedback','Ideen & Feedback','Ideas y comentarios','Suggestions et avis','Suggerimenti e feedback','Ideeën en feedback'],
 'Idioma da interface':['Interface language','Sprache der Oberfläche','Idioma de la interfaz','Langue de l’interface','Lingua dell’interfaccia','Interfacetaal'],
 'Idioma da Caixota':['Caixota language','Caixota-Sprache','Idioma de Caixota','Langue de Caixota','Lingua di Caixota','Caixota-taal'],
 'Escolha o idioma da interface.':['Choose the app language.','Wähle die Sprache.','Elige el idioma.','Choisissez la langue.','Scegli la lingua.','Kies een taal.'],
 'Algumas ferramentas ainda mostram textos em português.':['Some tools still contain Portuguese text.','Einige Tools sind noch auf Portugiesisch.','Algunas herramientas siguen en portugués.','Certains outils restent en portugais.','Alcuni strumenti sono ancora in portoghese.','Sommige tools zijn nog Portugees.'],
 'Traduções em fase de testes':['Translations are experimental','Übersetzungen im Test','Traducciones en pruebas','Traductions en cours de test','Traduzioni in fase di test','Vertalingen in testfase'],
 'Mostrar todos os botões':['Show all buttons','Alle Schaltflächen anzeigen','Mostrar todos los botones','Afficher tous les boutons','Mostra tutti i pulsanti','Alle knoppen tonen'],
 'Botões do canto superior direito':['Top-right buttons','Schaltflächen oben rechts','Botones de la esquina superior derecha','Boutons en haut à droite','Pulsanti in alto a destra','Knoppen rechtsboven'],
 'Idiomas':['Languages','Sprachen','Idiomas','Langues','Lingue','Talen'],
 'Automático':['Automatic','Automatisch','Automático','Automatique','Automatico','Automatisch'],
 'Tema':['Theme','Thema','Tema','Thème','Tema','Thema'],
 'Fonte':['Font','Schrift','Fuente','Police','Carattere','Lettertype'],
 'Modo desempenho':['Performance mode','Leistungsmodus','Modo rendimiento','Mode performance','Modalità prestazioni','Prestatiemodus'],
 'Sons':['Sounds','Töne','Sonidos','Sons','Suoni','Geluiden'],
 'Som ligado':['Sound on','Ton an','Sonido activado','Son activé','Audio attivo','Geluid aan'],
 'Som desligado':['Sound off','Ton aus','Sonido apagado','Son désactivé','Audio disattivo','Geluid uit'],
 'Notificações':['Notifications','Benachrichtigungen','Notificaciones','Notifications','Notifiche','Meldingen'],
 'Nenhuma notificação':['No notifications','Keine Benachrichtigungen','Sin notificaciones','Aucune notification','Nessuna notifica','Geen meldingen'],
 'Limpar todas':['Clear all','Alle löschen','Borrar todas','Tout effacer','Cancella tutte','Alles wissen'],
 'Tudo em dia':['All caught up','Alles erledigt','Todo al día','Tout est à jour','Tutto a posto','Alles bijgewerkt'],
 'Nova partida':['New game','Neues Spiel','Nueva partida','Nouvelle partie','Nuova partita','Nieuw spel'],
 'Começar':['Start','Starten','Empezar','Commencer','Inizia','Start'],
 'Pausar':['Pause','Pause','Pausar','Pause','Pausa','Pauze'],
 'Jogar':['Play','Spielen','Jugar','Jouer','Gioca','Spelen'],
 'Campo Minado':['Minesweeper','Minesweeper','Buscaminas','Démineur','Campo minato','Mijnenveger'],
 'Quebra-Blocos':['Breakout','Breakout','Rompebloques','Casse-briques','Rompimattoni','Blokkenbreker'],
 'Termo':['Word game','Wortspiel','Palabras','Mots','Parole','Woorden'],

 'Selecionar arquivos':['Select files','Dateien auswählen','Elegir archivos','Choisir des fichiers','Seleziona file','Bestanden kiezen'],
 'Selecionar arquivo':['Select file','Datei auswählen','Elegir archivo','Choisir un fichier','Seleziona file','Bestand kiezen'],
 'Escolher arquivo':['Choose file','Datei wählen','Elegir archivo','Choisir un fichier','Scegli un file','Kies bestand'],
 'Escolher arquivos':['Choose files','Dateien wählen','Elegir archivos','Choisir des fichiers','Scegli i file','Kies bestanden'],
 'Processar arquivo':['Process file','Datei verarbeiten','Procesar archivo','Traiter le fichier','Elabora file','Verwerk bestand'],
 'Baixar':['Download','Herunterladen','Descargar','Télécharger','Scarica','Downloaden'],
 'Baixar resultado':['Download result','Ergebnis herunterladen','Descargar resultado','Télécharger le résultat','Scarica risultato','Download resultaat'],
 'Copiar':['Copy','Kopieren','Copiar','Copier','Copia','Kopiëren'],
 'Salvar':['Save','Speichern','Guardar','Enregistrer','Salva','Opslaan'],
 'Fechar':['Close','Schließen','Cerrar','Fermer','Chiudi','Sluiten'],
 'Cancelar':['Cancel','Abbrechen','Cancelar','Annuler','Annulla','Annuleren'],
 'Aplicar':['Apply','Anwenden','Aplicar','Appliquer','Applica','Toepassen'],
 'Resultado':['Result','Ergebnis','Resultado','Résultat','Risultato','Resultaat'],
 'Resultados':['Results','Ergebnisse','Resultados','Résultats','Risultati','Resultaten'],
 'Opções':['Options','Optionen','Opciones','Options','Opzioni','Opties'],
 'Configurações avançadas':['Advanced settings','Erweiterte Einstellungen','Ajustes avanzados','Paramètres avancés','Impostazioni avanzate','Geavanceerde instellingen'],
 'Modo simples':['Simple mode','Einfacher Modus','Modo simple','Mode simple','Modalità semplice','Eenvoudige modus'],
 'Modo avançado':['Advanced mode','Erweiterter Modus','Modo avanzado','Mode avancé','Modalità avanzata','Geavanceerde modus'],
 'Simples':['Simple','Einfach','Simple','Simple','Semplice','Eenvoudig'],
 'Científica':['Scientific','Wissenschaftlich','Científica','Scientifique','Scientifica','Wetenschappelijk'],
 'Qualidade':['Quality','Qualität','Calidad','Qualité','Qualità','Kwaliteit'],
 'Formato':['Format','Format','Formato','Format','Formato','Formaat'],
 'Resolução':['Resolution','Auflösung','Resolución','Résolution','Risoluzione','Resolutie'],
 'Cor base':['Base color','Grundfarbe','Color base','Couleur de base','Colore base','Basiskleur'],
 'Gerar paleta':['Generate palette','Palette erstellen','Generar paleta','Créer une palette','Genera palette','Genereer palet'],
 'Copiar variáveis CSS':['Copy CSS variables','CSS-Variablen kopieren','Copiar variables CSS','Copier les variables CSS','Copia variabili CSS','Kopieer CSS-variabelen'],
 'Baixar CSS':['Download CSS','CSS herunterladen','Descargar CSS','Télécharger CSS','Scarica CSS','Download CSS'],
 'Gerar':['Generate','Erzeugen','Generar','Générer','Genera','Genereren'],
 'Calcular':['Calculate','Berechnen','Calcular','Calculer','Calcola','Berekenen'],
 'Iniciar':['Start','Starten','Iniciar','Démarrer','Avvia','Starten'],
 'Reiniciar':['Restart','Neustart','Reiniciar','Recommencer','Riavvia','Opnieuw starten'],
 'Privacidade':['Privacy','Datenschutz','Privacidad','Confidentialité','Privacy','Privacy'],
 'Processado no seu navegador':['Processed in your browser','Im Browser verarbeitet','Procesado en tu navegador','Traité dans le navigateur','Elaborato nel browser','Verwerkt in je browser'],
 'Não usa serviços externos.':['Does not use external services.','Keine externen Dienste.','No usa servicios externos.','Sans service externe.','Senza servizi esterni.','Geen externe diensten.'],
 'Cálculo local':['Local calculation','Lokale Berechnung','Cálculo local','Calcul local','Calcolo locale','Lokale berekening'],
 'Carregando':['Loading','Laden','Cargando','Chargement','Caricamento','Laden'],
 'Concluído':['Done','Fertig','Listo','Terminé','Completato','Klaar'],
 'Prévia':['Preview','Vorschau','Vista previa','Aperçu','Anteprima','Voorbeeld'],
 'Editar':['Edit','Bearbeiten','Editar','Modifier','Modifica','Bewerken'],
 'Convertendo':['Converting','Konvertieren','Convirtiendo','Conversion','Conversione','Converteren'],
 'Conversor de Vídeo':['Video converter','Videokonverter','Conversor de vídeo','Convertisseur vidéo','Convertitore video','Videoconverter'],
 'Gerador de Paletas':['Palette Generator','Palettengenerator','Generador de paletas','Générateur de palettes','Generatore di palette','Paletgenerator'],
 'Calculadora':['Calculator','Rechner','Calculadora','Calculatrice','Calcolatrice','Rekenmachine'],
 'Juntar Arquivos em PDF':['Merge PDF files','PDF-Dateien zusammenfügen','Unir archivos PDF','Fusionner des PDF','Unisci PDF','PDF-bestanden samenvoegen'],
 'Termo':['Word game','Wortspiel','Palabras','Mots','Parole','Woorden'],
 'Seu espaço, suas informações. Tudo é salvo localmente.':['Your space, your info. Saved on your device.','Deine Daten bleiben auf deinem Gerät.','Tu espacio y tus datos. Se guardan aquí.','Votre espace et vos infos restent ici.','Il tuo spazio e i tuoi dati restano qui.','Je ruimte en gegevens blijven lokaal.']
};

// Extensão offline de idioma: frases mais vistas pelo usuário e o catálogo.
const otherTranslations={
'Início':['ホーム','首页'],'Ferramentas':['ツール','工具'],'Todas as ferramentas':['すべてのツール','全部工具'],
'Favoritos':['お気に入り','收藏'],'Recentes':['最近使った項目','最近使用'],'Módulos':['モジュール','模块'],
'Entretenimento':['エンタメ','娱乐'],'Texto':['テキスト','文本'],'Imagens':['画像','图像'],'Vídeo':['動画','视频'],
'PDF':['PDF','PDF'],'Geradores':['ジェネレーター','生成器'],'Utilitários':['便利ツール','实用工具'],
'Jogos':['ゲーム','游戏'],'Sorteio':['抽選','抽签'],'Configurações':['設定','设置'],
'Apoiar a Caixota':['Caixota を応援','支持 Caixota'],'Perfil':['プロフィール','个人资料'],
'Meu perfil':['マイプロフィール','我的资料'],'Biblioteca':['ライブラリ','工具库'],
'BIBLIOTECA':['ライブラリ','工具库'],'ESPAÇO DE TRABALHO':['ワークスペース','工作区'],
'Busque qualquer ferramenta...':['ツールを検索...','搜索工具...'],'Buscar no catálogo':['一覧から探す','搜索工具库'],
'Pesquisar por nome, função ou palavra-chave...':['名前やキーワードで検索...','按名称或关键词搜索...'],
'Buscar algo':['検索','搜索'],'Explorar ferramentas':['ツールを見る','探索工具'],
'Ver catálogo completo':['すべて見る','查看全部'],'Todas':['すべて','全部'],'Offline':['オフライン','离线'],
'Com internet':['オンライン','需要网络'],'Internet':['インターネット','联网'],
'Abrir ferramenta':['ツールを開く','打开工具'],'Anterior':['前へ','上一步'],'Voltar':['戻る','返回'],
'FERRAMENTA':['ツール','工具'],'FERRAMENTA LOCAL':['ローカルツール','本地工具'],
'CARREGANDO FERRAMENTA':['読み込み中','正在加载工具'],
'Bom ter você por aqui':['ようこそ！','欢迎回来！'],
'O seu dia fica melhor':['毎日をもっと簡単に','让每一天更轻松'],
'O que vamos fazer hoje?':['今日は何をする？','今天想做什么？'],
'O que há na Caixota':['Caixota の新着情報','Caixota 新功能'],
'NOVIDADE':['新着','新功能'],'INÍCIO':['ホーム','首页'],
'Editar perfil':['プロフィールを編集','编辑个人资料'],
'Aparência':['外観','外观'],'Desempenho':['パフォーマンス','性能'],
'Comportamento':['操作設定','行为设置'],'Idioma e região':['言語と地域','语言与地区'],
'Ferramentas e módulos':['ツールとモジュール','工具与模块'],
'Sugestões e feedback':['ご意見・ご要望','建议与反馈'],
'Idioma da interface':['表示言語','界面语言'],'Idioma da Caixota':['Caixota の言語','Caixota 语言'],
'Escolha o idioma da interface.':['表示言語を選択してください。','请选择界面语言。'],
'Algumas ferramentas ainda mostram textos em português.':['一部のツールにはポルトガル語が残っています。','部分工具仍显示葡萄牙语。'],
'Automático':['自動','自动'],'Tema':['テーマ','主题'],'Fonte':['フォント','字体'],
'Modo desempenho':['省エネモード','性能模式'],'Sons':['音','声音'],
'Notificações':['通知','通知'],'Nenhuma notificação':['通知はありません','暂无通知'],
'Limpar todas':['すべて消去','全部清除'],'Tudo em dia':['新しい通知はありません','没有新消息'],
'Nova partida':['新しいゲーム','新游戏'],'Começar':['スタート','开始'],'Pausar':['一時停止','暂停'],
'Jogar':['プレイ','开始游戏'],'Campo Minado':['マインスイーパー','扫雷'],
'Quebra-Blocos':['ブロック崩し','打砖块'],'Termo':['単語当て','猜单词'],
'Teste de Velocidade':['速度テスト','网速测试'],'Baixador de Mídia':['メディア保存','媒体下载'],
'Dados de RPG':['TRPGダイス','角色扮演骰子'],'Roleta de Sorteio':['ルーレット抽選','幸运转盘'],
'Calculadora':['電卓','计算器'],'Gerador de Paletas':['配色ジェネレーター','调色板生成器'],
'Juntar Arquivos em PDF':['PDFを結合','合并 PDF'],'PDF para Texto':['PDFからテキスト','PDF 转文本'],
'Conversor de Vídeo':['動画を変換','视频转换'],'Editor Rápido':['動画エディター','视频编辑器'],
'Gerador de Senhas':['パスワード生成','密码生成器'],'Gerador de Nomes':['名前生成','名字生成器'],
'Dicionário':['辞書','词典'],'Tradutor':['翻訳','翻译'],
'Gerar':['生成','生成'],'Calcular':['計算','计算'],'Iniciar':['開始','开始'],
'Reiniciar':['やり直す','重新开始'],'Concluído':['完了','已完成'],
'Como usar':['使い方','使用说明'],'Selecionar arquivos':['ファイルを選択','选择文件'],
'Baixar':['ダウンロード','下载'],'Copiar':['コピー','复制'],
'Seu espaço de ferramentas':['あなたのツールボックス','你的工具箱'],
'Ferramentas no catálogo':['登録ツール','工具总数'],
'Categorias disponíveis':['カテゴリ数','分类总数'],
'Interface independente':['独立した画面','独立界面'],
'Prévia de interface':['画面プレビュー','界面预览'],
'Escolha seu caminho':['カテゴリを選ぶ','选择分类'],
'ESCOLHA SEU CAMINHO':['カテゴリを選ぶ','选择分类'],
'Todas as suas ferramentas, organizadas por categoria.':['ツールをカテゴリ別にまとめました。','所有工具按类别整理好了。'],
'Converta, crie e organize tudo no mesmo lugar.':['変換も作成も整理も、ここひとつ。','转换、创建、整理，一站搞定。'],
'SEU WORKSPACE CRIATIVO':['あなたのワークスペース','你的创作空间'],
'SEU ESPAÇO CRIATIVO':['あなたのクリエイティブ空間','你的创意空间'],
'APRESENTANDO CAIXOTA LAB':['新しい Caixota','全新 Caixota'],
'INTERNET':['インターネット','互联网'],
'Ferramenta local':['ローカルツール','本地工具'],
'Sem acesso a arquivos, rede ou dados pessoais':['ファイルや個人情報にはアクセスしません','不会访问个人文件或数据'],
'Pronto!':['準備完了！','准备好了！'],
'Idioma atualizado!':['言語を変更しました！','语言已更新！'],
};
const extraCommon={
 'Conexão, mídia e ferramentas do dia a dia':['Connection, media and everyday tools','Internet, Medien und Alltag','Conexión, medios y herramientas diarias','Connexion, médias et outils','Rete, media e utilità','Verbinding, media en tools','通信・メディア・便利ツール','网络、媒体和日常工具'],
 'Joguinhos offline para uma pausa':['Offline games for a break','Offline-Spiele für die Pause','Juegos sin conexión para descansar','Jeux hors ligne pour une pause','Giochi offline per una pausa','Offline spelletjes','休憩にぴったりのオフラインゲーム','离线小游戏，休息一下'],
 'Dados de RPG e roleta':['RPG dice and roulette','Würfel und Glücksrad','Dados de rol y ruleta','Dés et roue','Dadi e roulette','Dobbelstenen en rad','TRPGダイスとルーレット','RPG 骰子和转盘'],
 'Escreva, transforme e analise':['Write, transform and analyze','Schreiben, bearbeiten, analysieren','Escribe, transforma y analiza','Écrire, transformer, analyser','Scrivi e analizza','Schrijven en analyseren','文章を書く・変換・分析','编写、转换和分析文字'],
 'Edite com mais liberdade':['Edit images freely','Bilder frei bearbeiten','Edita imágenes libremente','Modifiez vos images','Modifica immagini','Bewerk afbeeldingen','画像編集をもっと自由に','自由编辑图片'],
 'Organize seus documentos':['Organize your documents','Dokumente organisieren','Organiza documentos','Organisez vos documents','Organizza documenti','Orden documenten','書類を整理','整理文档'],
 'Crie, experimente e sorteie':['Generate and create','Erstellen und ausprobieren','Crea y experimenta','Créez et expérimentez','Crea e sperimenta','Maak en probeer','作成・生成・抽選','生成、创作和抽签'],
 'Descubra uma, duas ou quatro palavras de cinco letras. Offline!':['Find one, two or four hidden five-letter words. Offline!','Errate ein, zwei oder vier Wörter.','Adivina una, dos o cuatro palabras.','Devinez un, deux ou quatre mots.','Indovina una, due o quattro parole.','Raad één, twee of vier woorden.','5文字の単語を1、2、4個当てよう。オフライン！','猜出 1、2 或 4 个五字母单词，离线可玩！'],
 'Rebata a bolinha e derrote o computador. Tudo offline!':['Hit the ball and beat the computer. Offline!','Besiege den Computer beim Pong!','Rebota la pelota y gana.','Renvoyez la balle et gagnez.','Rimbalza e vinci.','Versla de computer met Pong.','ボールを打ち返してコンピューターに勝とう！','击球挑战电脑，离线畅玩！'],
 'Rebata a bolinha para quebrar os blocos, sem deixar cair.':['Break the blocks without dropping the ball.','Zerstöre die Blöcke!','Rompe bloques sin dejar caer la pelota.','Cassez les briques sans perdre la balle.','Rompi i blocchi con la pallina.','Breek blokken zonder de bal te missen.','ボールを落とさずブロックを壊そう。','接住小球，打碎砖块！'],
 'Revele os quadrados seguros e sinalize as minas.':['Find safe squares and flag the mines.','Finde sichere Felder und markiere Minen.','Descubre casillas seguras y marca minas.','Trouvez les cases sûres et marquez les mines.','Scopri le caselle sicure e segnala le mine.','Zoek veilige vakken en markeer mijnen.','安全なマスを開けて地雷に旗を立てよう。','找出安全格子并标记地雷。'],
};
const extraIndex={en:0,de:1,es:2,fr:3,it:4,nl:5,ja:6,zh:7};
const specific={
 'NOVIDADES':['NEW','NEU','NOVEDADES','NOUVEAUTÉS','NOVITÀ','NIEUWS','新着','新功能'],
 'Três jogos novos pra sua pausa! 🎮':['Three new games for your break! 🎮','Drei Spiele für deine Pause! 🎮','¡Tres juegos para descansar! 🎮','Trois jeux pour votre pause ! 🎮','Tre giochi per una pausa! 🎮','Drie spellen voor je pauze! 🎮','休憩にぴったりの新しいゲーム3つ！🎮','三个全新的休闲游戏！🎮'],
 'Pong, Quebra-Blocos e Campo Minado chegaram. O Termo agora tem até quatro palavras e sete idiomas!':['Pong, Breakout and Minesweeper are here. Word Game now has up to four words and more languages!','Pong, Breakout und Minesweeper sind da! Das Wortspiel hat vier Wörter.','¡Llegaron Pong, Rompebloques y Buscaminas!','Pong, casse-briques et démineur sont arrivés !','Ecco Pong, Breakout e Campo minato!','Pong, Breakout en Mijnenveger zijn er!','Pong、ブロック崩し、マインスイーパーが登場！単語ゲームは最大4語に。','Pong、打砖块和扫雷上线！猜词游戏最多可猜四个词。'],
 'Documentos virando PDF, sem complicação.':['Make PDFs without the hassle.','PDFs ganz einfach erstellen.','Convierte documentos a PDF fácilmente.','Créez vos PDF facilement.','Crea PDF in modo semplice.','Maak eenvoudig PDF-bestanden.','書類をかんたんにPDFへ。','轻松将文档转成 PDF。'],
 'TXT, Word, Excel e slides: exporte o conteúdo em PDF sem enviar seus arquivos pela internet.':['Convert TXT, Word, Excel and slides to PDF locally.','TXT, Word, Excel und Folien lokal in PDF umwandeln.','Convierte documentos a PDF sin subirlos.','Convertissez vos documents en PDF localement.','Converti documenti in PDF offline.','Zet documenten lokaal om naar PDF.','TXT・Word・Excel・スライドをアップロードせずPDFに。','TXT、Word、Excel 和幻灯片无需上传即可转 PDF。'],
 'Pinterest também entrou na Caixota. 📌':['Pinterest is now in Caixota! 📌','Pinterest ist jetzt dabei! 📌','¡Pinterest llegó a Caixota! 📌','Pinterest arrive dans Caixota ! 📌','Anche Pinterest è su Caixota! 📌','Pinterest zit nu ook in Caixota! 📌','Pinterestにも対応しました！📌','现已支持 Pinterest！📌'],
 'Agora o Baixador de Mídia reconhece links de pins, além de X e Instagram.':['Download Pinterest pins as well as media from X and Instagram.','Jetzt auch Pinterest-Pins herunterladen.','Ahora reconoce enlaces de Pinterest, X e Instagram.','Pinterest, X et Instagram sont pris en charge.','Supporta Pinterest, X e Instagram.','Ondersteunt Pinterest, X en Instagram.','X・Instagramに加えてPinterestのピンにも対応。','除 X 和 Instagram 外，还支持 Pinterest 链接。'],
 'Explorar Jogos':['Explore games','Spiele entdecken','Explorar juegos','Explorer les jeux','Scopri i giochi','Ontdek spellen','ゲームを見る','探索游戏'],
 'Conhecer o conversor':['Explore converter','Konverter öffnen','Ver el conversor','Découvrir le convertisseur','Scopri il convertitore','Bekijk converter','変換ツールを見る','查看转换工具'],
 'Abrir baixador':['Open downloader','Downloader öffnen','Abrir descargador','Ouvrir le téléchargeur','Apri downloader','Open downloader','ダウンロードツールを開く','打开下载器'],
 
 'O que há de novo':['What’s new','Was ist neu','Qué hay de nuevo','Nouveautés','Novità','Wat is nieuw','新着情報','最新功能'],
 'Seu dia fica melhor com menos complicação.':['Get things done with less hassle.','Einfacher durch den Tag.','Menos complicaciones en tu día.','Moins de complications au quotidien.','Giornate più semplici.','Elke dag eenvoudiger.','毎日をもっとシンプルに。','让每一天都更简单。'],
 'Descubra as novidades da Caixota':['Discover what’s new in Caixota','Neuigkeiten entdecken','Descubre las novedades','Découvrez les nouveautés','Scopri le novità','Ontdek het nieuws','Caixota の新着情報を見る','探索 Caixota 新功能'],
};

const codeIndex={en:0,de:1,es:2,fr:3,it:4,nl:5};
function localized(original,lang){
 if(lang==='pt')return original;
 if(lang==='esd')return 'Jez élska dzju';
 if(finalPhrases[original]?.[lang])return finalPhrases[original][lang];
 if(releasePhrases[original]?.[lang])return releasePhrases[original][lang];
 if(additionalLanguages[lang]?.[original])return additionalLanguages[lang][original];
 const idx=codeIndex[lang],other=extraIndex[lang];
 if((lang==='ja'||lang==='zh')&&otherTranslations[original])return otherTranslations[original][lang==='ja'?0:1];
 if(catalogPhrases[original]&&['en','ja','zh'].includes(lang))return catalogPhrases[original][{en:0,ja:1,zh:2}[lang]];
 if(extraCommon[original]&&other!==undefined)return extraCommon[original][other];
 if(specific[original]&&other!==undefined)return specific[original][other];
 const own=idx!==undefined?P[original]?.[idx]:undefined;
 if(own)return own;
 if(commonEnglish[original])return commonEnglish[original];
 // English fallback for languages whose extended catalog isn't complete yet.
 if(catalogPhrases[original])return catalogPhrases[original][0];
 if(extraCommon[original])return extraCommon[original][0];
 if(specific[original])return specific[original][0];
 if(P[original])return P[original][0];
 if(finalPhrases[original])return finalPhrases[original].en;
 if(releasePhrases[original])return releasePhrases[original].en;
 const numeric=original.match(/^(\d+) (ferramentas?|conteúdos?|cores|nomes?|sobrenomes?)$/);
 if(numeric){const names={ferramenta:'tool',ferramentas:'tools',conteúdo:'item',conteúdos:'items',cores:'colors',nome:'name',nomes:'names',sobrenome:'surname',sobrenomes:'surnames'};return numeric[1]+' '+names[numeric[2]];}
 const upto=original.match(/^Até (\d+\s?(?:px|p))$/);if(upto)return 'Up to '+upto[1];
 const generated=original.match(/^(\d+) (parágrafo|frase|palavra)\(s\) gerado\(s\)\.$/);if(generated)return generated[1]+' '+({parágrafo:'paragraph(s)',frase:'sentence(s)',palavra:'word(s)'}[generated[2]])+' generated.';
 if(/^Cor \d+$/.test(original))return original.replace('Cor ','Color ');
 // Safe, limited prefixes in dynamic labels; never rewrite user content.
 const prefixes=[['← Voltar para ','← Back to '],['Voltar para ','Back to '],['Preparando ','Preparing ']];
 for(const [pt,en] of prefixes){if(original.startsWith(pt)){const tail=original.slice(pt.length);const next=localized(tail,lang);return en+next;}}
 return original;
}
const textSources=new WeakMap(),attributeSources=new WeakMap();
const skipTags=new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','SVG']);
export function translateShell(root=document,lang='pt'){
 document.documentElement.lang=lang==='pt'?'pt-BR':lang==='zh'?'zh-CN':lang==='esd'?'x-esd':lang;
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){if(!node.parentElement)return NodeFilter.FILTER_REJECT;const p=node.parentElement;if(p.closest('[data-no-translate],[contenteditable],.cx-profile-cover,.cx-avatar,.cx-word-result,.cx-termo-boards'))return NodeFilter.FILTER_REJECT;if(skipTags.has(p.tagName)||p.closest('svg'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
 const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
 for(const node of nodes){
  const displayed=node.nodeValue,retained=textSources.get(node);
  const source=retained?.rendered===displayed?retained.source:displayed,word=source.trim();if(!word)continue;
  let next=localized(word,lang);
  if(next===word){const dynamic=word.match(/^(.+?)\s+(\d+)$/);if(dynamic){const mapped=localized(dynamic[1],lang);if(mapped!==dynamic[1])next=word.replace(dynamic[1],mapped);}}
  const rendered=source.replace(word,next);if(rendered!==displayed)node.nodeValue=rendered;
  textSources.set(node,{source,rendered});
 }
 root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach(el=>{for(const attr of ['placeholder','aria-label','title']){const val=el.getAttribute(attr);if(!val||el.closest('[data-no-translate],[contenteditable]'))continue;let originals=attributeSources.get(el);if(!originals){originals={};attributeSources.set(el,originals);}let prior=originals[attr];const source=prior?.rendered===val?prior.source:val;const mapped=localized(source,lang);if(mapped!==val)el.setAttribute(attr,mapped);originals[attr]={source,rendered:mapped};}});
}
export function t(original,lang){return localized(original,lang);}
