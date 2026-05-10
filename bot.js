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

// 📌 CONFIG (NOMES EXATOS)
const CHANNEL_VALIDACAO = 'validação';
const CHANNEL_RECRUTAMENTO = 'inscricao'; // funciona mesmo com 📋・inscricao
const CATEGORY_TICKET = 'tickets';

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

// 🔍 função segura pra achar canal
function getChannelByName(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// 🚀 READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  // 📢 VALIDAÇÃO
  const canalValidacao = getChannelByName(guild, CHANNEL_VALIDACAO);

  const btnEntrar = new ButtonBuilder()
    .setCustomId('entrar')
    .setLabel('Entrar no servidor')
    .setStyle(ButtonStyle.Success);

  const rowEntrar = new ActionRowBuilder().addComponents(btnEntrar);

  if (canalValidacao) {
    await canalValidacao.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('👋 Bem-vindo à VOLTZ')
          .setDescription('Clique abaixo para liberar seu acesso')
      ],
      components: [rowEntrar]
    });
  }

  // 🎯 RECRUTAMENTO
  const canalRecruit = getChannelByName(guild, CHANNEL_RECRUTAMENTO);

  const btnTicket = new ButtonBuilder()
    .setCustomId('abrir_ticket')
    .setLabel('Se inscrever')
    .setStyle(ButtonStyle.Primary);

  const rowTicket = new ActionRowBuilder().addComponents(btnTicket);

  if (canalRecruit) {
    await canalRecruit.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Purple')
          .setTitle('🎯 Recrutamento VOLTZ')
          .setDescription('Clique abaixo para se inscrever no time')
      ],
      components: [rowTicket]
    });
  }
});

// 🎮 INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 BOTÕES
  if (interaction.isButton()) {

    // 👤 ENTRAR
    if (interaction.customId === 'entrar') {
      const role = interaction.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await interaction.member.roles.add(role);

      return interaction.reply({
        content: '✅ Acesso liberado!',
        ephemeral: true
      });
    }

    // 🎟️ TICKET
    if (interaction.customId === 'abrir_ticket') {

      const guild = interaction.guild;

      const categoria = getChannelByName(guild, CATEGORY_TICKET);

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoria?.id,
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

    // ✅ ACEITAR → TRYOUT
    if (interaction.customId.startsWith('aceitar_')) {

      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId);

      const roleAval = interaction.guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      const roleTryout = interaction.guild.roles.cache.find(r => r.name === ROLE_TRYOUT);

      if (roleAval) await member.roles.remove(roleAval);
      if (roleTryout) await member.roles.add(roleTryout);

      await member.send('🎉 Você foi aprovado para o TRYOUT da VOLTZ!');

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

  if (interaction.commandName === 'ping') {
    return interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === 'lock') {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });
    return interaction.reply('🔒 Canal fechado!');
  }

  if (interaction.commandName === 'unlock') {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: true
    });
    return interaction.reply('🔓 Canal aberto!');
  }

});

client.login(TOKEN);