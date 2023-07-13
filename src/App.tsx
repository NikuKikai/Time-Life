import React from 'react';
import './App.css';
import { useDrag } from '@use-gesture/react';


function shuffle(array: Array<any>) {
  for(let i = (array.length - 1); 0 < i; i--){
    let r = Math.floor(Math.random() * (i + 1));
    let tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}

function argsort(array: Array<any>) {
  const arrayObject = array.map((value, idx) => { return { value, idx }; });
  arrayObject.sort((a, b) => {
      if (a.value < b.value) {
          return -1;
      }
      if (a.value > b.value) {
          return 1;
      }
      return 0;
  });
  const argIndices = arrayObject.map(data => data.idx);
  return argIndices;
}


const data = [
  [1, 1, 1, 1, 1.5, 1, 2, 1, 1, 1.5, 1, 1, 1, 1, 1, 1.5],
  [2, 1.5, 1.5, 1, 1, 2, 2.5, 1.5, 2, 2.5, 1.5, 1.5, 1.5, 1, 1.5, 1.5],
  [2, 2.5, 2, 2, 1, 2.5, 2, 2.5, 3, 2.5, 2, 2, 2, 1.5, 2.5, 2],
  [3.5, 3, 3, 2.5, 1.2, 3.5, 2.5, 2.5, 3, 2.5, 2.5, 3, 2.5, 2, 2.5, 2],
  [4.5, 4, 3, 3, 5, 4, 3, 3.5, 1.3, 2.5, 3.5, 3, 3, 2.5, 2.5, 2.5],
  [4.5, 4.5, 4, 3.5, 5, 4.5, 4, 4, 5.5, 4, 3, 3.5, 4, 1.2, 3, 2.5],
  [5, 4, 5, 4.5, 4.5, 5, 5.5, 4.5, 5.5, 5.5, 4, 3.5, 4.5, 6.5, 1.2, 3.5],
  [5.5, 4.5, 5.5, 4.5, 4.5, 5.5, 5, 5, 4.5, 4.5, 2, 5, 5.5, 7, 6.5, 7],
  [6, 7, 6, 5.5, 6, 5.5, 6, 6.5, 7, 5, 5, 7, 7.5, 7, 7, 8],
];

shuffle(data);


const dataSum = data.map(dots =>
  dots.reduce(function(sum, element){
    return sum + element/dots.length;
  }, 0)
);

const dataOrder = argsort(dataSum);


function App() {
  const [scale, setScale] = React.useState(1);
  const [scaleTgt, setScaleTgt] = React.useState(1);
  const isScaling = React.useRef(false);

  const calcScaleTgt = (delta: number) => {
    let k = scaleTgt * 0.1;
    if (scaleTgt < 0.2 && delta > 0) {
      k = scaleTgt - 0.1;
    } else if (scaleTgt < 0.15 && delta < 0) {
      k = 0.2 - scaleTgt;
    }
    let s = scaleTgt - delta * k;
    s = Math.min(s, 1);
    s = Math.max(s, 0.1);
    setScaleTgt(s);
  }

  React.useEffect(() => {
    const onresize = () => {
      const vh = window.innerHeight/100;
      const vw = window.innerWidth/100
      document.documentElement.style.setProperty( '--vh', vh + 'px');
      document.documentElement.style.setProperty( '--vmin', Math.min(vh, vw) + 'px');
    };
    onresize();
    window.onresize = onresize;
    window.ondeviceorientation = onresize;
  }, [])

  React.useEffect(() => {
    // Transition speed
    const spd = 0.15;
    const err = scaleTgt - scale;
    if (err === 0) {
      isScaling.current = false;
      return;
    }
    isScaling.current = true;

    let ds = err * spd;
    ds = Math.min(Math.max(Math.abs(ds), 0.001), Math.abs(err)) * Math.sign(err);
    setTimeout(() => setScale(scale + ds), 15);
  }, [scale]);

  React.useEffect(() => {
    if (!isScaling.current) {
      let ds = (scaleTgt - scale) * 0.1;
      setScale(scale + ds);
    }
  }, [scaleTgt]);

  const onWheel = (e: React.WheelEvent) => {
    calcScaleTgt(e.deltaY/100);
  };

  const bind = useDrag(state => {
    calcScaleTgt(state.delta[1]/20);
  });


  // Calc size
  const size = 'calc(var(--vmin)*' + Math.max(scale, 0.2) * 90 + ')';

  // Calc block opacity
  const opacity = Math.min(1, (0.4 - scale) * 6);
  // Calc block color
  const getRgba = (gray: number, opacity: number) => {
    let g = Math.floor(gray * 20 + 10);
    return 'rgba('+g+','+g+','+g+','+opacity+')';
  }
  // Calc text opacity
  const opacityText = Math.min(1, Math.max(0, 0.15 - scale) * 20);

  return (
    <div className='App' {...bind()} onWheel={onWheel}>
      <div className='app-header'>
        <span style={{opacity: opacityText}}>TIME</span>
        <span style={{opacity: 0.5}}>-</span>
        <span style={{opacity: 1-opacityText}}>LIFE</span>
      </div>
      <div className='block-contianer' style={{width: size, height: size}}>
        {data.map((dots, i) => <div className='block' key={''+i} style={{backgroundColor: getRgba(dataSum[i], opacity)}}>
          <div className='block-flex'>
            {dots.map((x, j) => <div className='dot' key={''+j} style={{backgroundColor: getRgba(x, 1-opacity)}}></div>)}
          </div>
          <div className='block-overlay'><span style={{opacity: opacityText}}>{dataOrder.indexOf(i)+1}</span></div>
        </div>)}
      </div>
    </div>
  );
}

export default App;
