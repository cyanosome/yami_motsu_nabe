import { toggleSound } from './sound.js';
import { closeOnlineModal, createOnlineRoom, joinOnlineRoom, startOnlineGameHost, firebaseState } from './firebase.js';
import { gameState, startGame, resetToStart, submitDraftChoice, reshuffleScoop, handlePassClick } from './gameLogic.js';
import { openOnlineModal } from './ui.js';

// HTMLから呼び出されるグローバル関数をwindowオブジェクトに登録
window.toggleSound = toggleSound;
window.closeOnlineModal = closeOnlineModal;
window.createOnlineRoom = createOnlineRoom;
window.joinOnlineRoom = joinOnlineRoom;
window.startOnlineGameHost = startOnlineGameHost;
window.openOnlineModal = openOnlineModal;
window.startGame = startGame;
window.submitDraftChoice = submitDraftChoice;
window.reshuffleScoop = reshuffleScoop;
window.handlePassClick = handlePassClick;
window.resetToStart = resetToStart;

// デバッグ・監視用オブジェクトの登録
window.gameState = gameState;
window.firebaseState = firebaseState;
