/* global jest */
export class Telegraf {}

Telegraf.prototype.telegram = {
    sendMessage: jest.fn(),
    getMe: jest.fn().mockResolvedValue({ username: 'bot' }),
};