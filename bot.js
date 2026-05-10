console.log("🚀 VOLTZ BOT INICIANDO...");

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = '+';

// 📌 CONFIG (nomes dos canais)
const CHANNEL_VALIDACAO = 'validação';
const CHANNEL_RECRUTAMENTO = 'inscricao';
const CATEGORY_TICKET = 'tickets';

// 🎭 CARGOS
const ROLE_MEMBER = '👤 Membro';
const ROLE_AVALIACAO = '🧪 Em Avaliação';
const ROLE_TRYOUT = '🎯 Tryout';

// 📋 PERGUNTAS
const perguntas = [
  "Qual seu nome?",
  "Qual seu nick in game?",
  "Qual sua idade?",
  "Qual sua patente?",
  "Quantas horas de jogo você tem?",
  "Qual turno você joga?"
];

// 🔍 achar canal
function getChannel(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// 🚀 READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  // VALIDAÇÃO
  const canalValidacao = getChannel(guild, CHANNEL_VALIDACAO);

  const btnEntrar = new ButtonBuilder()
    .setCustomId('entrar')
    .setLabel('Entrar no servidor')
    .setStyle(ButtonStyle.Success);

  if (canalValidacao) {
    canalValidacao.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('👋 Bem-vindo à VOLTZ')
          .setDescription('Clique abaixo para liberar seu acesso')
      ],
      components: [new ActionRowBuilder().addComponents(btnEntrar)]
    });
  }

  // RECRUTAMENTO
  const canalRecruit = getChannel(guild, CHANNEL_RECRUTAMENTO);

  const btnTicket = new ButtonBuilder()
    .setCustomId('abrir_ticket')
    .setLabel('Se inscrever')
    .setStyle(ButtonStyle.Primary);

  if (canalRecruit) {
    canalRecruit.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Purple')
          .setTitle('🎯 Recrutamento VOLTZ')
          .setDescription('Clique abaixo para se inscrever')
      ],
      components: [new ActionRowBuilder().addComponents(btnTicket)]
    });
  }
});

// 🎮 INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // BOTÕES
  if (interaction.isButton()) {

    // ENTRAR
    if (interaction.customId === 'entrar') {
      const role = interaction.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await interaction.member.roles.add(role);

      return interaction.reply({ content: '✅ Acesso liberado!', ephemeral: true });
    }

    // TICKET
    if (interaction.customId === 'abrir_ticket') {

      const guild = interaction.guild;
      const categoria = getChannel(guild, CATEGORY_TICKET);

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoria?.id,
        permissionOverwrites: [
          { id: guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      await interaction.reply({ content: `🎟️ Ticket criado: ${canal}`, ephemeral: true });

      let respostas = [];
      const filter = m => m.author.id === interaction.user.id;

      for (let pergunta of perguntas) {
        await canal.send(pergunta);

        const collected = await canal.awaitMessages({ filter, max: 1, time: 60000 });
        if (!collected.size) return canal.send('⏰ Tempo esgotado.');

        respostas.push(collected.first().content);
      }

      const resumo = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('📋 Recrutamento')
        .addFields(
          { name: 'Nome', value: respostas[0] },
          { name: 'Nick', value: respostas[1] },
          { name: 'Idade', value: respostas[2] },
          { name: 'Patente', value: respostas[3] },
          { name: 'Horas', value: respostas[4] },
          { name: 'Turno', value: respostas[5] }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aceitar_${interaction.user.id}`).setLabel('Aceitar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
      );

      await canal.send({ embeds: [resumo], components: [row] });

      const role = guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      if (role) {
        const member = await guild.members.fetch(interaction.user.id);
        await member.roles.add(role);
      }

      canal.send('⏳ Aguardando avaliação...');
    }

    // ACEITAR
    if (interaction.customId.startsWith('aceitar_')) {
      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId);

      const roleAval = interaction.guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      const roleTryout = interaction.guild.roles.cache.find(r => r.name === ROLE_TRYOUT);

      if (roleAval) await member.roles.remove(roleAval);
      if (roleTryout) await member.roles.add(roleTryout);

      await member.send('🎉 Você foi aprovado para o TRYOUT!');
      await interaction.channel.send('✅ Aprovado!');

      setTimeout(() => interaction.channel.delete(), 5000);
    }

    // RECUSAR
    if (interaction.customId.startsWith('recusar_')) {
      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId);

      const roleAval = interaction.guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      if (roleAval) await member.roles.remove(roleAval);

      await member.send('❌ Você não foi aprovado.');
      await interaction.channel.send('❌ Recusado');

      setTimeout(() => interaction.channel.delete(), 5000);
    }
  }

  // SLASH COMMANDS
  if (!interaction.isChatInputCommand()) return;

  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (interaction.commandName === 'ping') return interaction.reply('🏓 Pong!');

  if (interaction.commandName === 'lock') {
    if (!isAdmin) return interaction.reply({ content: '❌ Sem permissão', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    return interaction.reply('🔒 Canal fechado!');
  }

  if (interaction.commandName === 'unlock') {
    if (!isAdmin) return interaction.reply({ content: '❌ Sem permissão', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    return interaction.reply('🔓 Canal aberto!');
  }
});

// PREFIX COMMANDS (+)
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (cmd === 'ping') return message.reply('🏓 Pong!');

  if (cmd === 'limpar') {
    if (!isAdmin) return message.reply('❌ Sem permissão');
    const qtd = parseInt(args[0]);
    if (!qtd) return message.reply('Use: +limpar 10');
    await message.channel.bulkDelete(qtd, true);
    return message.channel.send(`🧹 ${qtd} mensagens apagadas`);
  }

  if (cmd === 'anunciar') {
    if (!isAdmin) return message.reply('❌ Sem permissão');
    const texto = args.join(' ');
    if (!texto) return message.reply('Use: +anunciar mensagem');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('📢 ANÚNCIO')
      .setDescription(texto);

    return message.channel.send({ embeds: [embed] });
  }

});

client.login(TOKEN);