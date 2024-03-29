const { Command } = require('discord.js-commando');
const { balance, addMoney, removeMoney } = require('../../util/db');

module.exports = class TransferCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'transfer',
            group: 'economy',
            memberName: 'transfer',
            aliases: ['gib', 'pay', 'give'],
            description: 'Transfer a given amount of Fens from your balance to another user\'s balance. The transferance fee is of 15% from the total transfered amount.',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: 'user',
                    prompt: 'Towards which user would like to transfer the money?',
                    type: 'user'
                },
                {
                    key: 'fens',
                    prompt: 'How much money do you wish to transfer?',
                    type: 'integer',
                    validate: async (fens, msg) => {
                        let bal = await balance(msg.author.id);
                        if(fens > bal) return `You do not have enough money to proceed. Please try again with a new sum.`;
                        if(fens < 1) return `You cannot transfer less than 1 Fen. Please try again with a new sum.`;
                        return true;
                    }
                }
            ]
        });
    }

    run(msg, { user, fens }) {
        removeMoney(msg.author.id, fens);
        addMoney(user.id, Math.round(fens - (fens * 0.15)));
        addMoney(process.env.OWNERS, Math.round(fens * 0.15));

        msg.say(`**${msg.author.username}** sent ${Math.round(fens - (fens * 0.15))} Fens to **${user.username}**. The 15% tax has been automatically applied.`);
    }
}