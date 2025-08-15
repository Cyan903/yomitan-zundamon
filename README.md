# zundamon-yomitan

![code-size](https://img.shields.io/github/languages/code-size/cyan903/zundamon-yomitan) ![last-commit](https://img.shields.io/github/last-commit/cyan903/zundamon-yomitan) ![license](https://img.shields.io/github/license/cyan903/zundamon-yomitan)

This is a fallback audio source for Yomitan. This TTS is not pitch-accent aware, so you're better off using an audio source with native pronounciation. This is intended to be used as a final fallback so at least your Anki cards have some form of audio.

<br />

> [!WARNING]
> Yomitan requires **HTTPS** on domains that are not **localhost**. If you're planning on hosting this using a custom domain, make sure to setup HTTPS. [Here is a simple way to do so](https://www.youtube.com/watch?v=qlcVx-k-02E).

Voicevox presets are from [zundamon-bash-ui](https://github.com/iamyukihiro/zundamon-bash-ui/blob/main/conf/voicevox/presets.yaml). Credit goes to the original creator.

## Install

There is a Docker image avaliable at [Cyan903/zundamon-yomitan](https://hub.docker.com/r/cyan903/zundamon-yomitan).

```sh
docker compose up -d
```

## License

[MIT](MIT)

