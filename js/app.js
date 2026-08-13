import { toggleSound } from './sound.js';
import { closeOnlineModal, createOnlineRoom, joinOnlineRoom, startOnlineGameHost, firebaseState } from './firebase.js';
import { gameState, startGame, resetToStart, submitDraftChoice, reshuffleScoop, handlePassClick } from './gameLogic.js';
import { openOnlineModal, openEncyclopediaModal, closeEncyclopediaModal, switchEncyclopediaTab, filterEncyclopediaCategory, openComboDetailModal, closeComboDetailModal } from './ui.js';
import { initPot3D, disposePot3D, updateSoupColor } from './pot3d.js';

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
window.openEncyclopediaModal = openEncyclopediaModal;
window.closeEncyclopediaModal = closeEncyclopediaModal;
window.switchEncyclopediaTab = switchEncyclopediaTab;
window.filterEncyclopediaCategory = filterEncyclopediaCategory;
window.openComboDetailModal = openComboDetailModal;
window.closeComboDetailModal = closeComboDetailModal;

// 3D 鍋レンダリング関数のグローバル登録
window.initPot3D = initPot3D;
window.disposePot3D = disposePot3D;
window.updateSoupColor = updateSoupColor;

// デバッグ・監視用オブジェクトの登録
window.gameState = gameState;
window.firebaseState = firebaseState;
