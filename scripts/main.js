// Listener per als sons enviats pel DM
Hooks.once("ready", () => {
    console.log("SoundBoard v11: Loaded");

    // Listener per rebre sons enviats pel director de joc
    game.socket.on("module.soundboard-v11", data => {
        if (data.action === "play" && data.players.includes(game.user.id)) {
            AudioHelper.play({
                src: data.sound.src,
                volume: data.sound.volume,
                loop: data.sound.loop || false
            });
        }
    });
});

// Funció per enviar sons a jugadors específics
function sendSoundToPlayers(soundSrc, volume, playerIds) {
    game.socket.emit("module.soundboard-v11", {
        action: "play",
        sound: {
            src: soundSrc,
            volume: volume,
            loop: false
        },
        players: playerIds
    });
}

// Exemple: Registra una macro global per facilitar l'ús
Hooks.once("init", () => {
    game.soundboard = {
        playToPlayers: sendSoundToPlayers
    };
});
