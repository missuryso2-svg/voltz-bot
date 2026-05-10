const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ID do bot
const GUILD_ID = process.env.GUILD_ID;   // ID do servidor (mais rápido pra testar)

// 📦 COMANDOS
const commands = [

  // 📊 STATS
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Ver estatísticas do time'),

  // 🏆 CAMPEONATO
  new SlashCommandBuilder()
    .setName('registrar_campeonato')
    .setDescription('Registrar campeonatos')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade')
        .setRequired(true)
    ),

  // 🎮 RANKED
  new SlashCommandBuilder()
    .setName('ranked_win')
    .setDescription('Adicionar wins ranked')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade')
        .setRequired(true)
    ),

  // 🔨 BAN
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banir usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    ),

  // 👢 KICK
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    ),

  // 🔒 LOCK
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Fechar canal'),

  // 🔓 UNLOCK
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Abrir canal'),

  // 🧹 LIMPAR
  new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Apagar mensagens')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade')
        .setRequired(true)
    ),

  // 📢 ANUNCIAR
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
    .setDescription('Enviar mensagem de recrutamento'),

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

    console.log('✅ Comandos atualizados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();