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

// CONFIG
const ROLE_MEMBER = '👤 Membro';
const ROLE_AVALIACAO = '🧪 Em Avaliação';
const ROLE_TRYOUT = '🎯 Tryout';

const CHANNEL_WELCOME = 'boas-vindas';
const CATEGORY_TICKET = 'tickets';

// PERGUNTAS
const perguntas = [
  "Qual seu nome?",
  "Qual seu nick in game?",
  "Qual sua idade?",
  "Qual sua patente?",
  "Quantas horas de jogo você tem?",
  "Qual turno você joga?"
];

// READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const canal = guild.channels.cache.find(c => c.name === CHANNEL_WELCOME);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('👋 Bem-vindo à VOLTZ')
    .setDescription('Clique abaixo para entrar no servidor');

  const btnEntrar = new ButtonBuilder()
    .setCustomId('entrar')
    .setLabel('Entrar')
    .setStyle(ButtonStyle.Success);

  const btnTicket = new ButtonBuilder()
    .setCustomId('abrir_ticket')
    .setLabel('Se inscrever')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(btnEntrar, btnTicket);

  if (canal) canal.send({ embeds: [embed], components: [row] });
});

// INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 BOTÕES
  if (interaction.isButton()) {

    // ENTRAR (Membro)
    if (interaction.customId === 'entrar') {
      const role = interaction.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await interaction.member.roles.add(role);

      return interaction.reply({
        content: '✅ Você entrou no servidor!',
        ephemeral: true
      });
    }

    // 🎟️ TICKET
    if (interaction.customId === 'abrir_ticket') {

      const guild = interaction.guild;
      const category = guild.channels.cache.find(c => c.name === CATEGORY_TICKET);

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category?.id,
        permissionOverwrites: [
          { id: guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] }
        ]
      });

      await interaction.reply({
        content: `🎟️ Ticket criado: ${canal}`,
        ephemeral: true
      });

      let respostas = [];
      const filter = m => m.author.id === interaction.user.id;

      for (let i = 0; i < perguntas.length; i++) {
        await canal.send(perguntas[i]);

        const collected = await canal.awaitMessages({
          filter,
          max: 1,
          time: 60000
        });

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

      const btnAceitar = new ButtonBuilder()
        .setCustomId(`aceitar_${interaction.user.id}`)
        .setLabel('Aceitar')
        .setStyle(ButtonStyle.Success);

      const btnRecusar = new ButtonBuilder()
        .setCustomId(`recusar_${interaction.user.id}`)
        .setLabel('Recusar')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(btnAceitar, btnRecusar);

      await canal.send({ embeds: [resumo], components: [row] });

      const role = guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      if (role) {
        const member = await guild.members.fetch(interaction.user.id);
        await member.roles.add(role);
      }

      canal.send('⏳ Aguardando avaliação...');
    }

    // ✅ ACEITAR
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

    // ❌ RECUSAR
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

  // 📜 COMANDOS
  if (!interaction.isChatInputCommand()) return;

  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (interaction.commandName === 'ping') {
    return interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === 'lock') {
    if (!isAdmin) return interaction.reply({ content: '❌ Sem permissão', ephemeral: true });

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    return interaction.reply('🔒 Canal fechado!');
  }

  if (interaction.commandName === 'unlock') {
    if (!isAdmin) return interaction.reply({ content: '❌ Sem permissão', ephemeral: true });

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: true
    });

    return interaction.reply('🔓 Canal aberto!');
  }

});

client.login(TOKEN);