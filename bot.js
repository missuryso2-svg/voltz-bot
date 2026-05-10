console.log("🚀 VOLTZ BOT PRO INICIANDO...");

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
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
const ROLE_AVALIACAO = '🧪 Em Avaliação';
const ROLE_TRYOUT = '🎯 Tryout';

const CHANNEL_WELCOME = 'validação';
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
    .setColor('Purple')
    .setTitle('🎯 RECRUTAMENTO VOLTZ')
    .setDescription('Clique no botão abaixo para se inscrever');

  const btn = new ButtonBuilder()
    .setCustomId('abrir_ticket')
    .setLabel('Se inscrever')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(btn);

  if (canal) canal.send({ embeds: [embed], components: [row] });
});

// INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 CRIAR TICKET
  if (interaction.isButton() && interaction.customId === 'abrir_ticket') {

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

      if (!collected.size) {
        canal.send('⏰ Tempo esgotado.');
        return;
      }

      respostas.push(collected.first().content);
    }

    const resumo = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('📋 Novo Recrutamento')
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

  // ✅ ACEITAR → TRYOUT
  if (interaction.isButton() && interaction.customId.startsWith('aceitar_')) {

    const userId = interaction.customId.split('_')[1];
    const member = await interaction.guild.members.fetch(userId);

    const roleAval = interaction.guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
    const roleTryout = interaction.guild.roles.cache.find(r => r.name === ROLE_TRYOUT);

    if (roleAval) await member.roles.remove(roleAval);
    if (roleTryout) await member.roles.add(roleTryout);

    await member.send('🎉 Você foi aprovado para o TRYOUT da VOLTZ!');

    await interaction.channel.send('✅ Jogador aprovado para TRYOUT!');

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }

  // ❌ RECUSAR
  if (interaction.isButton() && interaction.customId.startsWith('recusar_')) {

    const userId = interaction.customId.split('_')[1];
    const member = await interaction.guild.members.fetch(userId);

    const roleAval = interaction.guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
    if (roleAval) await member.roles.remove(roleAval);

    await member.send('❌ Você não foi aprovado desta vez.');

    await interaction.channel.send('❌ Jogador recusado.');

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }

});

// LOGIN
client.login(TOKEN);