import Lottie from "lottie-react";

// Cricket ball bouncing animation data
const cricketLoaderAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Cricket Ball Loader",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Ball",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 60, s: [360] }
          ]
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [100, 100], e: [100, 60] },
            { t: 15, s: [100, 60], e: [100, 140] },
            { t: 30, s: [100, 140], e: [100, 80] },
            { t: 45, s: [100, 80], e: [100, 140] },
            { t: 60, s: [100, 140] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [50, 50] },
              p: { a: 0, k: [0, 0] },
              nm: "Ball Shape"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.8, 0.1, 0.1, 1] },
              o: { a: 0, k: 100 },
              nm: "Red Fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Ball Group"
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [4, 15] },
              p: { a: 0, k: [0, -12] },
              r: { a: 0, k: 2 },
              nm: "Seam 1"
            },
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [4, 15] },
              p: { a: 0, k: [0, 12] },
              r: { a: 0, k: 2 },
              nm: "Seam 2"
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 100 },
              nm: "White Seam"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Seam Group"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Shadow",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [30], e: [60] },
            { t: 15, s: [60], e: [20] },
            { t: 30, s: [20], e: [50] },
            { t: 45, s: [50], e: [20] },
            { t: 60, s: [20] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 170] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 20], e: [100, 20] },
            { t: 15, s: [100, 20], e: [60, 15] },
            { t: 30, s: [60, 15], e: [90, 18] },
            { t: 45, s: [90, 18], e: [60, 15] },
            { t: 60, s: [60, 15] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [50, 15] },
              p: { a: 0, k: [0, 0] },
              nm: "Shadow Shape"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0, 0, 0, 1] },
              o: { a: 0, k: 100 },
              nm: "Shadow Fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Shadow Group"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

interface CricketLoaderProps {
  size?: number;
  message?: string;
}

const CricketLoader = ({ size = 120, message = "Loading..." }: CricketLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Lottie 
        animationData={cricketLoaderAnimation} 
        loop={true}
        style={{ width: size, height: size }}
      />
      <p className="text-muted-foreground font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default CricketLoader;
