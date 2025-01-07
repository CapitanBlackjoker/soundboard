class SoundBoardApp extends Application {
  /** Configuració bàsica de la interfície */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "soundboard-app",
      title: "SoundBoard v11",
      template: "modules/soundboard/templates/soundboard.html",
      width: 500,
      height: "auto",
      resizable: true,
    });
  }

  /** Carrega els sons disponibles */
  async getData() {
    const sounds = await FilePicker.browse("data", "modules/soundboard/sounds/");
    const players = game.users.filter((u) => u.active && !u.isGM); // Jugadors actius que no són GM
    return { sounds: sounds.files, players };
  }

  /** Registra els events de la interfície */
  activateListeners(html) {
    super.activateListeners(html);

    // Reproduir so localment
    html.find(".play-sound").click((event) => {
      const soundSrc = event.currentTarget.dataset.src;
      AudioHelper.play({ src: soundSrc, volume: 0.8, loop: false });
    });

    // Enviar so a jugadors seleccionats
    html.find(".send-sound").click((event) => {
      const soundSrc = event.currentTarget.dataset.src;
      const playerId = html.find("select[name='player-select']").val();

      if (playerId) {
        game.socket.emit("module.soundboard-v11", {
          action: "play",
          sound: { src: soundSrc, volume: 0.8, loop: false },
          players: [playerId],
        });
      } else {
        ui.notifications.warn("Has de seleccionar un jugador!");
      }
    });
  }
}

// Listener per rebre sons
Hooks.once("ready", () => {
  console.log("SoundBoard v11: Loaded");

  game.socket.on("module.soundboard-v11", (data) => {
    if (data.action === "play" && data.players.includes(game.user.id)) {
      AudioHelper.play({
        src: data.sound.src,
        volume: data.sound.volume,
        loop: data.sound.loop || false,
      });
    }
  });

  // Registra un botó per obrir el SoundBoard
  if (game.user.isGM) {
    Hooks.on("getSceneControlButtons", (controls) => {
      controls.push({
        name: "soundboard",
        title: "SoundBoard",
        icon: "fas fa-music",
        layer: "controls",
        tools: [
          {
            name: "open-soundboard",
            title: "Open SoundBoard",
            icon: "fas fa-play-circle",
            onClick: () => new SoundBoardApp().render(true),
            button: true,
          },
        ],
      });
    });
  }
});
