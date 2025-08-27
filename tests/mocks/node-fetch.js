export default async function fetch() {
    return {
        ok: true,
        json: async() => ({ atividade: [] }),
        text: async() => '',
        status: 200,
        statusText: 'OK',
    };
}