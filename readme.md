# loungeFM

> loungeFM livestreamed to your browser

## Features

- ASCII Animations
- Livestreaming audio

## Dependencies

- Node > 12
- ffmpeg: https://formulae.brew.sh/formula/ffmpeg

## Development

```sh
# Install ffmpeg
brew install ffmpeg

# Install Node dependencies
yarn

# Link binary
yarn link --global

# run dev server
yarn dev

# run prod server
cd audio # location of mp3 files
loungefm
```
