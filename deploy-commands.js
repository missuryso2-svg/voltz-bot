const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ID do bot
const GUILD_ID = process.env.GUILD_ID;   // ID do servidor

// 🧠 LISTA DE COMANDOS
const commands = [

  // 🧪 TESTE
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verificar se o bot está online'),

  // 🔒 FECHAR CANAL
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Fechar o canal'),

  // 🔓 ABRIR CANAL
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Abrir o canal'),

  // 🔨 BAN
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banir usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário a ser banido')
        .setRequired(true)
    ),

  // 👢 KICK
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário a ser expulso')
        .setRequired(true)
    ),

  // 🧹 LIMPAR
  new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Apagar mensagens')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade de mensagens')
        .setRequired(true)
    ),

  // 📢 ANÚNCIO
  new SlashCommandBuilder()
    .setName('anunciar')
    .setDescription('Enviar anúncio')
    .addStringOption(opt =>
      opt.setName('mensagem')
        .setDescription('Texto do anúncio')
        .setRequired(true)
    ),

  // 🎯 RECRUTAMENTO
  new SlashCommandBuilder()
    .setName('recrutamento')
    .setDescription('Abrir recrutamento'),

  // ❌ FECHAR RECRUTAMENTO
  new SlashCommandBuilder()
    .setName('fechar_recrutamento')
    .setDescription('Fechar recrutamento')

].map(cmd => cmd.toJSON());

// 🚀 DEPLOY
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔄 Atualizando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();