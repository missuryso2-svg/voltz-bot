require('dotenv').config();

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [

  // PING
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está online'),

  // LOCK
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Fechar canal para membros'),

  // UNLOCK
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Abrir canal novamente'),

  // BAN
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banir usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para banir')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setDescription('Motivo do ban')
        .setRequired(false)
    ),

  // KICK
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para expulsar')
        .setRequired(true)
    ),

  // MUTE
  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutar usuário por 1 hora')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para mutar')
        .setRequired(true)
    ),

  // UNMUTE
  new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remover mute de usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para desmutar')
        .setRequired(true)
    ),

  // TRYOUT
  new SlashCommandBuilder()
    .setName('tryout')
    .setDescription('Aprovar usuário como Tryout')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário aprovado')
        .setRequired(true)
    ),

  // RECRUTAMENTO ABRIR
  new SlashCommandBuilder()
    .setName('recrutamento')
    .setDescription('Abrir recrutamento'),

  // RECRUTAMENTO FECHAR
  new SlashCommandBuilder()
    .setName('fechar_recrutamento')
    .setDescription('Fechar recrutamento'),

  // MENSAGEM
  new SlashCommandBuilder()
    .setName('mensagem')
    .setDescription('Enviar mensagem personalizada')
    .addStringOption(option =>
      option
        .setName('texto')
        .setDescription('Conteúdo da mensagem')
        .setRequired(true)
    )

].map(command => command.toJSON());

const rest = new REST({
  version: '10'
}).setToken(TOKEN);

(async () => {

  try {

    console.log('🔄 Registrando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log('✅ Comandos registrados com sucesso!');

  } catch (error) {

    console.error('❌ Erro ao registrar comandos:', error);

  }

})();