import { ipcRenderer } from 'electron'

export interface HistoryEntry {
    hash: string
    author: string
    timestamp: string
    message: string
}

// const lineSplitRegex = /\r?\n/
// const isDefined = (value: string) => !!value
const escapeShellValue = (value: string) => value.replace(/(["'$`\\])/g, '\\$1')

export default class Gopass {
    public static executionId = 1

    public static async copy(key: string): Promise<string> {
        return Gopass.execute(`show "${escapeShellValue(key)}" -c`)
    }

    public static show(key: string): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(btoa(key))
            }, 500)
        })
    }

    public static async history(key: string): Promise<HistoryEntry[]> {
        return [
            {
                hash: 'asdf42s',
                author: 'Matthias Rütten <matthias.ruetten@codecentric.de>',
                timestamp: new Date() as any,
                message: 'Removed Recipient 640F1D1D0E31A7BDEEEB8D99E8E300B26BE714EF'
            },
            {
                hash: '512sfasdasd',
                author: 'Jonas Verhoelen <jonas.verhoelen@codecentric.de>',
                timestamp: new Date() as any,
                message: 'Removed Recipient 640F1D1D0E31A7BDEEEB8D99E8E300B26BE714EF'
            }
        ]
    }

    public static async sync(): Promise<void> {
        await Gopass.execute('sync')
    }

    public static async getAllSecretNames(): Promise<string[]> {
        return [
            'codecentric/cassandra/url',
            'codecentric/cassandra/username',
            'codecentric/cassandra/password',
            'codecentric/twenty-percent-time/some-stuff',
            'codecentric/docker-registry/username',
            'codecentric/docker-registry/password',
            'codecentric/docker-registry/url',
            'codecentric/keycloak/username',
            'codecentric/keycloak/password',
            'codecentric/keycloak/url',
            'codecentric/kubernetes/dev/username',
            'codecentric/kubernetes/dev/password',
            'codecentric/kubernetes/dev/host',
            'codecentric/kubernetes/prod/username',
            'codecentric/kubernetes/prod/password',
            'codecentric/aws/username',
            'codecentric/aws/password',
            'codecentric/opsgenie/username',
            'codecentric/opsgenie/password',
            'codecentric/slack/username',
            'codecentric/slack/password',
            'codecentric/kibana/username',
            'codecentric/kibana/password',
            'open-source/gopass-ui/some-secret',
            'open-source/golumbus/some-secret',
            'open-source/fish-history-to-zsh/some-secret',
            'open-source/node-cassandra-migration/some-secret',
            'open-source/react-mobx-i18n/some-secret'
        ]
    }

    public static addSecret(name: string, value: string): Promise<void> {
        return Promise.resolve()
    }

    public static async editSecret(name: string, newValue: string): Promise<void> {
        await Gopass.addSecret(name, newValue)
    }

    public static async deleteSecret(name: string): Promise<void> {
        return Promise.resolve()
    }

    private static execute(command: string, args?: string[], pipeTextInto?: string): Promise<string> {
        // tslint:disable-next-line

        const result = new Promise<string>((resolve, reject) => {
            ipcRenderer.once(`gopass-answer-${Gopass.executionId}`, (_: Event, value: any) => {
                if (value.status === 'ERROR') {
                    reject(value.payload)
                } else {
                    resolve(value.payload)
                }
            })
        })

        ipcRenderer.send('gopass', { executionId: Gopass.executionId, command, args, pipeTextInto })

        Gopass.executionId++

        return result
    }
}
