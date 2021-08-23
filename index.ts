///----------------------------------///
/// VenoX Scripting Service 2021 © ////
///----------------------------------///


// Imports 
///<reference types="@altv/types-client" />
///<reference types="@altv/types-natives" />

import * as alt from 'alt-client';
import * as game from 'natives';



// Setings : 
let MaxDistance: number = 5; // Number in Meters.
let WashDuration: number = 2500; // Number in MS 


// Variables : 
let carWashUI: alt.WebView;
let localPlayer: alt.Player = alt.Player.local;
let washStations = [
    { X: 26.5906, Y: -1392.0261, Z: 27.3634 },
    { X: -74.5693, Y: 6427.8715, Z: 29.4400 },
    { X: -699.6325, Y: -932.7043, Z: 17.0139 },
    { X: 167.1034, Y: -1719.4704, Z: 27.2916 },
    { X: 1362.5385, Y: 3592.1274, Z: 33.9211 }
];

// loading : 
game.requestNamedPtfxAsset("scr_carwash");
game.requestPtfxAsset();

// Debug : 
/*for (let _c in washStations)
    game.addBlipForCoord(washStations[_c].X, washStations[_c].Y, washStations[_c].Z);
*/

// alt:V Events : 
alt.on('keydown', key => {
    // check key 
    if (key != 'E'.charCodeAt(0) || alt.isConsoleOpen() || !localPlayer.vehicle) return;
    // save player pos
    let plPos = localPlayer.pos;
    for (let _c in washStations)
        if (game.getDistanceBetweenCoords(plPos.x, plPos.y, plPos.z, washStations[_c].X, washStations[_c].Y, washStations[_c].Z, true) < MaxDistance)
            return createWindow();
});


alt.onServer('carwash:createParticleFx', () => {
    if (!localPlayer.vehicle) return destroyWindow(false);
    // request dict
    game.useParticleFxAsset("scr_carwash");
    // create looped on coord
    let washEffect = game.startParticleFxLoopedAtCoord("ent_amb_car_wash", localPlayer.pos.x, localPlayer.pos.y, localPlayer.pos.z, 0, 0, 0, 1, false, false, false, false);
    alt.setTimeout(() => {
        game.stopParticleFxLooped(washEffect, true);
        game.freezeEntityPosition(localPlayer.vehicle.scriptID, false);
    }, WashDuration);
    destroyWindow(true);
});

// Functions : 
function createWindow() {
    if (carWashUI) return;

    /* Webwview */
    carWashUI = new alt.WebView('http://resource/cef/index.html');
    carWashUI.focus();
    alt.toggleGameControls(false);
    alt.showCursor(true);
    game.freezeEntityPosition(localPlayer.vehicle.scriptID, true);
    /* Events based on the Webview */
    carWashUI.on('carwash:accept', () => alt.emitServer('carwash:cleanVehicle'));
    carWashUI.on('carwash:deny', () => destroyWindow(false));
}

function destroyWindow(freeze: Boolean) {
    if (!carWashUI) return;
    carWashUI.destroy();
    alt.toggleGameControls(true);
    alt.showCursor(false);
    carWashUI = null;
    if (!freeze && localPlayer.vehicle)
        game.freezeEntityPosition(localPlayer.vehicle.scriptID, false);
}
