// Renders the course icon library into ./icons2 as <name>-<colorname>.png
// Run: node render-icons.js
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const lu = require("react-icons/lu");
const fa = require("react-icons/fa");

const OUT = path.join(__dirname, "icons2");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const COLORS = { ink: "#1D1D1F", white: "#FFFFFF", blue: "#0071E3", orange: "#F56300", gray: "#86868B" };

// name -> react-icons component
const LIB = {
  // devices / spectrum
  cloud: lu.LuCloud, laptop: lu.LuLaptop, smartphone: lu.LuSmartphone, watch: lu.LuWatch,
  board: lu.LuCircuitBoard, cpu: lu.LuCpu, tablet: lu.LuTablet, monitor: lu.LuMonitor,
  server: lu.LuServer, hardware: lu.LuHardDrive, harddrive: lu.LuHardDrive,
  memory: lu.LuMemoryStick, grid: lu.LuLayoutGrid,
  // brands
  apple: fa.FaApple, android: fa.FaAndroid, react: fa.FaReact, github: fa.FaGithub,
  google: fa.FaGoogle, js: fa.FaJs, docker: fa.FaDocker, aws: fa.FaAws,
  // general purpose
  target: lu.LuTarget, scale: lu.LuScale, zap: lu.LuZap, gitbranch: lu.LuGitBranch,
  gitpr: lu.LuGitPullRequest, gitcommit: lu.LuGitCommitHorizontal, gitmerge: lu.LuGitMerge,
  battery: lu.LuBatteryMedium, batterycharging: lu.LuBatteryCharging, batterylow: lu.LuBatteryLow,
  thermometer: lu.LuThermometer, wifioff: lu.LuWifiOff, wifi: lu.LuWifi, store: lu.LuStore,
  radio: lu.LuRadio, radiotower: lu.LuRadioTower, bluetooth: lu.LuBluetooth, globe: lu.LuGlobe,
  share: lu.LuShare2, checklist: lu.LuListChecks, calendar: lu.LuCalendarCheck,
  bookopen: lu.LuBookOpen, graduation: lu.LuGraduationCap, users: lu.LuUsers, user: lu.LuUser,
  check: lu.LuCheck, x: lu.LuX, arrowright: lu.LuArrowRight, arrowleftright: lu.LuArrowLeftRight,
  arrowupdown: lu.LuArrowUpDown, plus: lu.LuPlus, minus: lu.LuMinus, info: lu.LuInfo,
  // languages / compilation
  code: lu.LuCode, braces: lu.LuBraces, terminal: lu.LuTerminal, binary: lu.LuBinary,
  cog: lu.LuCog, settings: lu.LuSettings2, wrench: lu.LuWrench, hammer: lu.LuHammer,
  package: lu.LuPackage, packageopen: lu.LuPackageOpen, boxes: lu.LuBoxes, blocks: lu.LuBlocks,
  recycle: lu.LuRecycle, trash: lu.LuTrash2, gauge: lu.LuGauge, timer: lu.LuTimer,
  // ui / widgets / state
  layers: lu.LuLayers, layout: lu.LuLayoutDashboard, panels: lu.LuPanelsTopLeft,
  component: lu.LuComponent, frame: lu.LuFrame, palette: lu.LuPalette, brush: lu.LuBrush,
  eye: lu.LuEye, mousepointer: lu.LuMousePointerClick, hand: lu.LuHand, sparkles: lu.LuSparkles,
  workflow: lu.LuWorkflow, network: lu.LuNetwork, split: lu.LuSplit, repeat: lu.LuRepeat,
  refresh: lu.LuRefreshCw, rotate: lu.LuRotateCw, history: lu.LuHistory, undo: lu.LuUndo2,
  // async / threads
  hourglass: lu.LuHourglass, clock: lu.LuClock, play: lu.LuPlay, pause: lu.LuPause,
  fastforward: lu.LuFastForward, activity: lu.LuActivity, waves: lu.LuWaves, radar: lu.LuRadar,
  // networking / backend
  cable: lu.LuCable, plug: lu.LuPlug, satellite: lu.LuSatelliteDish, route: lu.LuRoute,
  arrowupfromline: lu.LuArrowUpFromLine, arrowdowntoline: lu.LuArrowDownToLine,
  database: lu.LuDatabase, cloudupload: lu.LuCloudUpload, clouddownload: lu.LuCloudDownload,
  webhook: lu.LuWebhook, rss: lu.LuRss, send: lu.LuSend, inbox: lu.LuInbox,
  // security / auth
  lock: lu.LuLock, unlock: lu.LuLockOpen, key: lu.LuKeyRound, shield: lu.LuShield,
  shieldcheck: lu.LuShieldCheck, shieldalert: lu.LuShieldAlert, fingerprint: lu.LuFingerprint,
  scan: lu.LuScanFace, badge: lu.LuBadgeCheck, eyeoff: lu.LuEyeOff,
  // observability / debugging
  bug: lu.LuBug, bugoff: lu.LuBugOff, chart: lu.LuChartLine, barchart: lu.LuChartColumn,
  piechart: lu.LuChartPie, trending: lu.LuTrendingUp, trendingdown: lu.LuTrendingDown,
  alert: lu.LuTriangleAlert, bell: lu.LuBell, search: lu.LuSearch, microscope: lu.LuMicroscope,
  stethoscope: lu.LuStethoscope, filetext: lu.LuFileText, clipboard: lu.LuClipboardList,
  // AI
  brain: lu.LuBrain, bot: lu.LuBot, wand: lu.LuWand, messagesquare: lu.LuMessageSquare,
  messages: lu.LuMessagesSquare, mic: lu.LuMic, camera: lu.LuCamera, image: lu.LuImage,
  scantext: lu.LuScanText, languages: lu.LuLanguages,
  // offline / sync
  cloudoff: lu.LuCloudOff, foldersync: lu.LuFolderSync, refreshoff: lu.LuRefreshCwOff,
  save: lu.LuSave, download: lu.LuDownload, upload: lu.LuUpload, archive: lu.LuArchive,
  merge: lu.LuMerge, gitfork: lu.LuGitFork, combine: lu.LuCombine,
  // deploy / stores
  rocket: lu.LuRocket, ship: lu.LuShip, truck: lu.LuTruck, flag: lu.LuFlag,
  toggle: lu.LuToggleRight, sliders: lu.LuSlidersHorizontal, playcircle: lu.LuCirclePlay,
  circlecheck: lu.LuCircleCheck, circlealert: lu.LuCircleAlert, circlex: lu.LuCircleX,
  // sensors / embedded
  thermo: lu.LuThermometerSun, lightbulb: lu.LuLightbulb, power: lu.LuPower, plugzap: lu.LuPlugZap,
  compass: lu.LuCompass, mappin: lu.LuMapPin, map: lu.LuMap, move: lu.LuMove3D,
  microchip: lu.LuMicrochip, usb: lu.LuUsb, antenna: lu.LuAntenna, signal: lu.LuSignal,
};

(async () => {
  const missing = [];
  let n = 0;
  for (const [name, Icon] of Object.entries(LIB)) {
    if (!Icon) { missing.push(name); continue; }
    for (const [cname, hex] of Object.entries(COLORS)) {
      const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color: hex, size: 256 }));
      await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(OUT, `${name}-${cname}.png`));
      n++;
    }
  }
  fs.writeFileSync(path.join(__dirname, "icon-names.txt"),
    Object.keys(LIB).filter((k) => LIB[k]).sort().join("\n") + "\n");
  console.log("rendered", n, "files for", Object.keys(LIB).length - missing.length, "icons");
  if (missing.length) console.log("MISSING (fix these names):", missing.join(", "));
})();
