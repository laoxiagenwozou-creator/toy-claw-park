import town from './assets/town.webp';import garden from './assets/garden.webp';import lookout from './assets/lookout.webp';
import yard from './assets/yard.webp';import reef from './assets/reef.webp';import space from './assets/space.webp';
import snow from './assets/snow-festival.webp';import snowCard from './assets/card-snow.webp';
import townCard from './assets/card-town.webp';import gardenCard from './assets/card-garden.webp';import lookoutCard from './assets/card-lookout.webp';
import yardCard from './assets/card-yard.webp';import reefCard from './assets/card-reef.webp';import spaceCard from './assets/card-space.webp';
import pony from './assets/pony.webp';import ponyCard from './assets/card-pony.webp';
import peppa from './assets/peppa.webp';import peppaCard from './assets/card-peppa.webp';
import sheriff from './assets/sheriff.webp';import sheriffCard from './assets/card-sheriff.webp';
import chicks from './assets/chicks.webp';import chicksCard from './assets/card-chicks.webp';
import spidey from './assets/spidey.webp';import spideyCard from './assets/card-spidey.webp';
import {stageBackdrop,stageCardUrl} from './scene-art.js';
const art=id=>({bg:()=>stageBackdrop(id),card:()=>stageCardUrl(id)});
export const THEMES={
  snow:{name:'雪地玩偶屋',bg:snow,card:snowCard,base:'#4e7e87',mat:'#628e91',mark:'snow',aimAt:'玩偶圆圆的身体'},
  town:{name:'玩具车小镇',bg:town,card:townCard,base:'#a3bfcc',mat:'#eddfbd',mark:'road',aimAt:'车身中间'},
  lookout:{name:'汪汪队总部',bg:lookout,card:lookoutCard,base:'#89b9cf',mat:'#efdcb9',mark:'paw',aimAt:'狗狗背上的救援包'},
  yard:{name:'布鲁伊的后院',bg:yard,card:yardCard,base:'#b7cfa7',mat:'#e8e3bb',mark:'sun',aimAt:'公仔身体的中间'},
  garden:{name:'奇妙花房',bg:garden,card:gardenCard,base:'#aac9ac',mat:'#eae3c5',mark:'leaf',aimAt:'玻璃花罩正中'},
  reef:{name:'珊瑚海湾',bg:reef,card:reefCard,base:'#90c6cf',mat:'#e2e7cf',mark:'wave',aimAt:'小动物身体最厚的地方'},
  space:{name:'星空基地',bg:space,card:spaceCard,base:'#b3b0d0',mat:'#e4decd',mark:'star',aimAt:'太空玩具的主体'},
  pony:{name:'小马宝莉',bg:pony,card:ponyCard,base:'#c5adce',mat:'#efe1de',mark:'rainbow',aimAt:'小马的背部'},
  peppa:{name:'小猪佩奇',bg:peppa,card:peppaCard,base:'#9ac2a0',mat:'#f1dfbc',mark:'hill',aimAt:'公仔身体的中间'},
  sheriff:{name:'啦咘啦哆警长',bg:sheriff,card:sheriffCard,base:'#8eb9c8',mat:'#e9ddc4',mark:'shield',aimAt:'巡逻伙伴或装备的中间'},
  chicks:{name:'萌鸡小队',bg:chicks,card:chicksCard,base:'#abbd8e',mat:'#eedbb5',mark:'nest',aimAt:'小伙伴圆圆的身体'},
  spidey:{name:'蜘蛛侠',bg:spidey,card:spideyCard,base:'#aaaccc',mat:'#e8d7cc',mark:'web',aimAt:'英雄或机器人的身体'},
  recycle:{name:'环保垃圾分类站',...art('recycle'),base:'#78b88d',mat:'#e2eedb',mark:'recycle',aimAt:'垃圾桶盖或垃圾车车厢正中'},
  dino:{name:'恐龙山谷',...art('dino'),base:'#b89f6b',mat:'#ebe1be',mark:'dino',aimAt:'恐龙圆滚滚的背脊'},
  construct:{name:'工程建设工地',...art('construct'),base:'#d1b06a',mat:'#f0e3c4',mark:'construct',aimAt:'工程车车身或安全帽正中'},
  train:{name:'蒸汽小火车站',...art('train'),base:'#89a9b8',mat:'#e5dfd1',mark:'train',aimAt:'火车车厢或机车顶部正中'},
  farm:{name:'阳光牧场',...art('farm'),base:'#a2c27c',mat:'#eee6c2',mark:'farm',aimAt:'小动物或农庄玩具的中间'},
  bakery:{name:'甜蜜烘焙屋',...art('bakery'),base:'#dea8b5',mat:'#f5e6df',mark:'bakery',aimAt:'甜点圆圆的正中间'},
  fruit:{name:'缤纷果园',...art('fruit'),base:'#a8c776',mat:'#edf0c8',mark:'fruit',aimAt:'大水果饱满的中间'},
  kitchen:{name:'美味料理屋',...art('kitchen'),base:'#d4a882',mat:'#f2e4cc',mark:'kitchen',aimAt:'美食或餐具的正中央'},
  bamboo:{name:'熊猫竹林',...art('bamboo'),base:'#88b996',mat:'#e3edd6',mark:'bamboo',aimAt:'熊猫或竹林好物的正中'},
  insect:{name:'昆虫秘密花园',...art('insect'),base:'#9ac589',mat:'#eaf0cf',mark:'insect',aimAt:'小昆虫的圆背正中'},
  safari:{name:'非洲大草原',...art('safari'),base:'#cfa46e',mat:'#f0e2c0',mark:'safari',aimAt:'草原动物身体的中间'},
  polar:{name:'极地冰川',...art('polar'),base:'#7fb6cf',mat:'#e0eef5',mark:'polar',aimAt:'极地伙伴圆润的背部'},
  castle:{name:'童话城堡',...art('castle'),base:'#bca6d8',mat:'#f0e4f2',mark:'castle',aimAt:'童话伙伴或魔法宝物正中'},
  pirate:{name:'海盗藏宝湾',...art('pirate'),base:'#7cb0be',mat:'#ebe3c6',mark:'pirate',aimAt:'宝箱或海盗船的正中间'},
  robot:{name:'未来机甲工厂',...art('robot'),base:'#86a0c4',mat:'#dfe6f0',mark:'robot',aimAt:'机器人躯干或能量核正中'},
  music:{name:'音乐舞台',...art('music'),base:'#a88ac4',mat:'#ebe0e8',mark:'music',aimAt:'乐器主体最宽的地方'},
  sports:{name:'活力运动场',...art('sports'),base:'#7eb88c',mat:'#e2eed8',mark:'sports',aimAt:'运动器材或奖杯的正中'},
  camp:{name:'星空露营地',...art('camp'),base:'#7294a8',mat:'#dfe6dd',mark:'camp',aimAt:'露营帐篷或装备的正中'},
  circus:{name:'欢乐马戏团',...art('circus'),base:'#cf8e8e',mat:'#f2e3cc',mark:'circus',aimAt:'马戏团道具或小熊正中'},
  amusement:{name:'梦幻游乐园',...art('amusement'),base:'#c998b8',mat:'#f2e4e6',mark:'amusement',aimAt:'游乐设施或甜品正中间'},
  airport:{name:'蓝天国际机场',...art('airport'),base:'#7fb6d9',mat:'#e2edf4',mark:'airport',aimAt:'飞机机身或机场车辆正中'},
  hospital:{name:'暖心小医院',...art('hospital'),base:'#8cc4cf',mat:'#e5f2f0',mark:'hospital',aimAt:'救护车或医疗玩具正中'},
  firehouse:{name:'烈火消防营',...art('firehouse'),base:'#cf8b82',mat:'#f2e4da',mark:'firehouse',aimAt:'消防车或消防装备正中'},
  harbor:{name:'繁忙集装箱港',...art('harbor'),base:'#7aa8c4',mat:'#e0ebf0',mark:'harbor',aimAt:'轮船甲板或灯塔正中'},
  school:{name:'快乐小学堂',...art('school'),base:'#ccb878',mat:'#f2ebd0',mark:'school',aimAt:'校车或文具玩具正中'},
  festival:{name:'新春庙会街',...art('festival'),base:'#d4827a',mat:'#f5e2cf',mark:'festival',aimAt:'醒狮或新春好物正中'},
  egypt:{name:'金字塔探险',...art('egypt'),base:'#d4b072',mat:'#f3e6c8',mark:'egypt',aimAt:'金字塔或沙漠伙伴正中'},
  sakura:{name:'樱花和风街',...art('sakura'),base:'#dfa8be',mat:'#f6e8ee',mark:'sakura',aimAt:'柴犬或和风摆件正中'},
  desert:{name:'西部牛仔镇',...art('desert'),base:'#cc9a6e',mat:'#f2e2c8',mark:'desert',aimAt:'马车或牛仔装备正中'},
  aquarium:{name:'梦幻海底隧道',...art('aquarium'),base:'#6daec8',mat:'#dceef4',mark:'aquarium',aimAt:'海洋伙伴或潜艇正中'},
  artstudio:{name:'小小画室',...art('artstudio'),base:'#c8a484',mat:'#f2e8da',mark:'artstudio',aimAt:'画具或手工作品正中'},
  icecreamshop:{name:'冰淇淋小屋',...art('icecreamshop'),base:'#dfa6b8',mat:'#f5e8ec',mark:'icecreamshop',aimAt:'冰淇淋甜筒正中间'},
  petshop:{name:'萌宠咖啡馆',...art('petshop'),base:'#cfa884',mat:'#f2e8d6',mark:'petshop',aimAt:'萌宠小伙伴圆圆的身体'},
  greenhouse:{name:'多肉植物园',...art('greenhouse'),base:'#88be94',mat:'#e4efe0',mark:'greenhouse',aimAt:'花盆或植物正中央'},
  library:{name:'童话绘本馆',...art('library'),base:'#b08e72',mat:'#ede2d2',mark:'library',aimAt:'绘本或复古摆件正中'},
  cloudland:{name:'云端彩虹国',...art('cloudland'),base:'#90bfe0',mat:'#e8f2f8',mark:'cloudland',aimAt:'云朵或彩虹天气伙伴正中'},
  halloween:{name:'南瓜糖果夜',...art('halloween'),base:'#947cb4',mat:'#e8e0f0',mark:'halloween',aimAt:'南瓜灯或糖果伙伴正中'},
  christmas:{name:'圣诞雪橇村',...art('christmas'),base:'#7ea8c2',mat:'#e4eef4',mark:'christmas',aimAt:'圣诞老人或礼物正中'},
  gemmine:{name:'水晶宝石矿',...art('gemmine'),base:'#8e82ba',mat:'#e4e0f0',mark:'gemmine',aimAt:'矿车或水晶宝石正中'},
  superhero:{name:'机甲赛车场',...art('superhero'),base:'#869ec4',mat:'#e2e8f0',mark:'superhero',aimAt:'赛车车身或奖杯正中'},
};
