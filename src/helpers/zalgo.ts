import externalZalgo from 'zalgo-js'

export default function zalgo(text: string) {
  return externalZalgo(text, {
    intensity: 0.5,
    seed: '1',
  })
}
