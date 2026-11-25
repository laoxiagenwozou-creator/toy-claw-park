import {CATALOG,toyModel} from './vehicles.js';
import {PUPS,pupModel} from './pups.js';
import {PLANTS} from './garden.js';
import {REEF} from './reef.js';
import {SPACE} from './space.js';
import {HEELERS} from './heelers.js';
import {PLUSH} from './plush.js';
import {PONIES} from './ponies.js';
import {PEPPA} from './peppa-family.js';
import {POLICE} from './forest-police.js';
import {KATURI} from './katuri.js';
import {SPIDEY} from './spider-friends.js';
import {ECO_DINO} from './toys-eco-dino.js';
import {FOOD_NATURE} from './toys-food-nature.js';
import {WILD_FANTASY} from './toys-wild-fantasy.js';
import {FUN_PLAY} from './toys-fun-play.js';
import {externalModel,prepareModel} from './imported.js';
const grips={fire:[.05,.99,0],racer:[-.07,.43,0],plane:[-.024,.47,0],scooter:[.06,.25,0],crane:[-.12,.63,0],
 bus:[0,.79,0],tipper:[-.08,.64,0],icecream:[-.04,.74,0],helicopter:[.12,.51,0],convertible:[-.045,.47,0]};
const vehicles=Object.fromEntries(Object.entries(CATALOG).map(([id,spec])=>[id,{name:spec.name,make:()=>{
  const model=toyModel(id),[x,y,z]=grips[id];
  model.userData.grip={x:x*spec.scale,y:Math.min(y*spec.scale,model.userData.height*.92),z,rx:id==='scooter'?.245:.315,rz:id==='scooter'?.156:.235};
  return model;
}}]));
const pups=Object.fromEntries(Object.entries(PUPS).map(([id,spec])=>[id,{...spec,make:()=>id==='skye'?externalModel(id):pupModel(id)}]));
export const PRIZES={...vehicles,...PLANTS,...pups,...HEELERS,...REEF,...SPACE,...PLUSH,...PONIES,...PEPPA,...POLICE,...KATURI,...SPIDEY,
  ...ECO_DINO,...FOOD_NATURE,...WILD_FANTASY,...FUN_PLAY,
  bluey:{name:'布鲁伊',make:()=>externalModel('bluey')},bingo:{name:'宾果',make:()=>externalModel('bingo')}};
export const POOLS={
  snow:Object.keys(PLUSH),
  town:['fire','racer','plane','scooter','crane','bus','tipper','icecream','helicopter','convertible'],
  lookout:['chase','marshall','skye','rubble','rocky','zuma'],yard:['bluey','bingo','chilli','bandit','muffin','socks'],
  garden:Object.keys(PLANTS),reef:Object.keys(REEF),space:Object.keys(SPACE),
  pony:Object.keys(PONIES),peppa:Object.keys(PEPPA),sheriff:Object.keys(POLICE),chicks:Object.keys(KATURI),spidey:Object.keys(SPIDEY),
  recycle:['binBlue','binGreen','binRed','binGray','truckGreen','truckYellow'],
  dino:['dinoTrex','dinoTricera','dinoBrachio','dinoStego','dinoPtero','dinoEgg'],
  construct:['excavator','bulldozer','mixerTruck','roller','hardHat','coneCart'],
  train:['steamEngine','coachCar','coalCar','bulletTrain','railCrane','signalTower'],
  farm:['farmCow','farmSheep','farmPig','farmRooster','farmTractor','farmBarn'],
  bakery:['shortcake','donutPink','croissant','macaronTower','bearCookie','matchaCupcake'],
  fruit:['strawberry','watermelon','pineapple','redApple','bananaBoat','grapeCluster'],
  kitchen:['shrimpSushi','ramenBowl','burger','pizzaSlice','fryPanEgg','teaPot'],
  bamboo:['giantPanda','redPanda','bambooShoot','redLantern','porcelainCup','bambooFan'],
  insect:['ladybug','butterfly','honeyBee','beetle','mantis','snail'],
  safari:['giraffe','lionCub','babyElephant','zebra','hippo','croc'],
  polar:['polarBear','orcaWhale','babySeal','blueWhale','snowFox','igloo'],
  castle:['unicorn','babyDragon','crownPrince','magicWand','pumpkinCoach','fairyTower'],
  pirate:['treasureChest','pirateShip','parrot','octopusCap','goldAnchor','spyglassBarrel'],
  robot:['retroBot','sphereAI','mechWalker','quadDrone','hoverCar','powerCore'],
  music:['miniPiano','acousticGuitar','jazzDrum','goldTrumpet','miniViolin','xylophone'],
  sports:['soccerBall','basketball','goldTrophy','shuttleSet','skateboard','boxingGlove'],
  camp:['campTent','campfire','campLantern','backpack','marshmallow','compass'],
  circus:['circusBear','clownHat','circusTent','unicycle','magicHatRabbit','hotBalloon'],
  amusement:['ferrisWheel','carouselHorse','coasterCar','popcornTub','cottonCandy','bumperCar'],
};
export const preparePrizes=ids=>Promise.all(ids.map(prepareModel));
