import { Telegraf, Markup } from 'telegraf';
import config from 'config';
import { message } from 'telegraf/filters';

const SUPPORT_GROUP_CHAT_ID = -4568979226;
const ADD_NEW_SPOT_GROUP_CHAT_ID = -1002425822144;

const bot = new Telegraf(config.get('TELEGRAM_BOT_TOKEN'));

let userState = {};

const sendMainMenu = (ctx) => {
  ctx.reply(
    'Будем рады вам помочь🙂 По какой теме вы хотите с нами связаться?',
    Markup.inlineKeyboard([
      [Markup.button.callback('Порекомендовать место', 'recommend_spot')],
      [Markup.button.callback('Оставить отзыв, предложение или идею', 'feedback')],
      [Markup.button.callback('Стать партнером', 'partner')],
      [Markup.button.callback('Сообщить о проблеме', 'report_issue')],
    ])
  );
};
const sendThankMessage = (ctx) => {
  ctx.reply('Спасибо! Мы обязательно вернемся с обратной связью');
  sendMainMenu(ctx);
}

bot.start((ctx) => {
  ctx.reply(`Приветствуем вас в приложении Funspot!
Мы уверены, что с нашей помощью вы легко найдете необычные места для отдыха.
Откройте приложение и посмотрите наш гайд, чтобы узнать, как быстро и удобно находить лучшие локации.
Если появятся вопросы, просто используйте команду /support, и мы с радостью поможем!
Приятного отдыха и новых впечатлений!`);
});

bot.command('support', async (ctx) => {
  sendMainMenu(ctx);
});

bot.action('feedback', (ctx) => {
  ctx.reply('Пожалуйста, расскажите как нам стать лучше или предложите свою идею💡');

  userState[ctx.from.id] = 'feedback';
});

bot.action('recommend_spot', (ctx) => {
  ctx.reply('Отправьте нам ссылку с информацией (Яндексю.Карты, сайт или группа) и расскажите почему это место классное🤩');

  userState[ctx.from.id] = 'recommend_spot';
});

bot.action('partner', (ctx) => {
  ctx.reply('Напишите нам если вы владелец спота или хотите узнать о наших программах для партнеров🤝');
  
  userState[ctx.from.id] = 'partner';
});

bot.action('report_issue', (ctx) => {
  ctx.reply('Напишите нам, что у нас сломалось! Мы будем рады если вы пришлете скриншот с проблемой🙏');

  userState[ctx.from.id] = 'report_issue';
});

bot.on(message('text'), (ctx) => {
  const state = userState[ctx.from.id];

  if (state === 'feedback') {
    bot.telegram.sendMessage(SUPPORT_GROUP_CHAT_ID, `Отзыв от @${ctx.from.username}: ${ctx.message.text}`);
    sendThankMessage(ctx);
  } else if (state === 'recommend_spot') {
    bot.telegram.sendMessage(ADD_NEW_SPOT_GROUP_CHAT_ID, `Рекомендация места от @${ctx.from.username}: ${ctx.message.text}`);
    sendThankMessage(ctx);
  } else if (state === 'partner') {
    bot.telegram.sendMessage(SUPPORT_GROUP_CHAT_ID, `Запрос на партнерство от @${ctx.from.username}: ${ctx.message.text}`);
    sendThankMessage(ctx);
  } else if (state === 'report_issue') {
    bot.telegram.sendMessage(SUPPORT_GROUP_CHAT_ID, `Сообщение о проблеме от @${ctx.from.username}: ${ctx.message.text}`);
    sendThankMessage(ctx);
  } else {
    ctx.reply('Пожалуйста, выберите действие через меню.');
  }

  userState[ctx.from.id] = null;
});

bot.on(message('photo'), (ctx) => {
  const state = userState[ctx.from.id];

  if (state === 'report_issue') {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const caption = ctx.message.caption ? ctx.message.caption : 'Фото без описания';
    bot.telegram.sendPhoto(SUPPORT_GROUP_CHAT_ID, fileId, { caption: `Проблема от @${ctx.from.username}: ${caption}` });
    sendThankMessage(ctx);
  } else {
    ctx.reply('Пожалуйста, выберите действие через меню.');
  }

  userState[ctx.from.id] = null;
});

bot.catch((err, ctx) => {
  console.log(`Ошибка у пользователя ${ctx.from.id}:`, err);
  bot.telegram.sendMessage(SUPPORT_GROUP_CHAT_ID, `Ошибка VDS Support Bot. Произошла у пользователя @${ctx.from.username}: ${err.message}`);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Код как узнать id чата группы
// import { Telegraf } from 'telegraf';
// import config from 'config';

// const bot = new Telegraf(config.get('TELEGRAM_BOT_TOKEN'));

// bot.on('message', (ctx) => {
//   console.log(ctx.chat);
// });

// bot.launch();