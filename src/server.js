#!/usr/bin/env node

import "dotenv/config";

import Fastify from "fastify";
import consola from "consola";
import fs from "fs";

const { HOST, PORT, VOX, API } = process.env;

const fastify = Fastify();
const keys = String(API).split(",");

// Auth
async function auth(req, res) {
    if (String(API) == "") return;

    if (!keys.includes(req.query?.api)) {
        return res.code(403).send({
            code: 403,
            message: "Invalid API key",
        });
    }
}

async function createPreset(text, preset = 1) {
    const req = await fetch(
        `${VOX}/audio_query_from_preset?preset_id=${preset}&text=${encodeURIComponent(text)}`,
        { method: "POST" },
    );

    if (req.status != 200) {
        consola.error(`[createPreset] ${req}`);
        return false;
    }

    return await req.json();
}

async function createAudio(preset, speaker = 3) {
    const req = await fetch(`${VOX}/synthesis?speaker=${speaker}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
    });

    if (req.status != 200) {
        consola.error(`[createAudio] ${req}`);
        return false;
    }

    return await req.blob();
}

// Routes
fastify.get("/", (_, res) => {
    return res.send({
        code: 200,
        message: "Ok",
    });
});

fastify.get("/list", { onRequest: [auth] }, async (_, res) => {
    const presets = await fetch(`${VOX}/presets`);
    const speakers = await fetch(`${VOX}/speakers`);

    if (presets.status == 200 && speakers.status == 200) {
        return res.send({
            code: 200,
            presets: await presets.json(),
            speakers: await speakers.json(),
        });
    }

    consola.error("[/list]", presets, speakers);

    return res.code(500).send({
        code: 500,
        message: "Internal server error",
    });
});

fastify.get("/audio", { onRequest: [auth] }, async (req, res) => {
    const { term, reading, preset, speaker } = req.query;

    if ([term, reading].includes(undefined)) {
        return res.code(400).send({
            code: 400,
            message: "Bad request",
        });
    }

    const pre = preset || 1;
    const speak = speaker || 3;
    const file = `data/${term}-${reading}-${pre}-${speak}.wav`;

    // Fetch audio (if it exists)
    if (fs.existsSync(file)) {
        consola.info(`Loading -> ${term} (${reading})`);

        return res
            .header("Content-Type", "audio/wav")
            .header("Content-Disposition", "inline")
            .send(fs.createReadStream(file));
    }

    // Generate audio
    consola.info(`Generating -> ${term} (${reading})`);

    try {
        const presets = await createPreset(reading, pre);
        if (!presets) return res.code(500).send({ code: 500, message: "Couldn't generate preset" });

        const audio = await createAudio(presets, speak);
        if (!audio) return res.code(500).send({ code: 500, message: "Couldn't generate audio" });

        const buffer = Buffer.from(await audio.arrayBuffer());

        fs.writeFileSync(file, buffer);
        res.header("Content-Type", "audio/wav").send(buffer);
    } catch (e) {
        consola.error("[/audio] failed to get audio");
        consola.error(e);

        return res.code(500).send({
            code: 500,
            message: "Internal server error",
        });
    }
});

// Listen
fastify.listen({ port: PORT, host: HOST }, (err) => {
    if (err) {
        consola.fatal(err);
        process.exit(1);
    }

    consola.info(`Running on ${HOST}:${PORT} (${VOX})`);
});
