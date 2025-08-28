export const Telegraf = jest.fn().mockImplementation(function TelegrafMock(this: any) {
  // Instances share the prototype telegram so legacy tests can reset via prototype
  this.telegram = (Telegraf as any).prototype.telegram;
});

(Telegraf as any).prototype.telegram = {
  sendMessage: jest.fn(),
  getMe: jest.fn().mockResolvedValue({ username: 'bot' }),
};
