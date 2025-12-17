import Lottie from "lottie-react";

// Stumps animation data
const stumpsAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 150,
  h: 200,
  nm: "Stumps",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Stumps",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [75, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [-25, 0] }, r: { a: 0, k: 2 } },
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [25, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.65, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stumps Group"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [65, 6] }, p: { a: 0, k: [0, -55] }, r: { a: 0, k: 3 } },
            { ty: "rc", d: 1, s: { a: 0, k: [65, 6] }, p: { a: 0, k: [0, -48] }, r: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.9, 0.75, 0.5, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Bails Group"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

// Bat swing animation
const batSwingAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 150,
  h: 200,
  nm: "Bat Swing",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bat",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-30], e: [45] },
            { t: 20, s: [45], e: [45] },
            { t: 40, s: [45], e: [-30] },
            { t: 60, s: [-30] }
          ]
        },
        p: { a: 0, k: [75, 150] },
        a: { a: 0, k: [0, 60, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [35, 80] }, p: { a: 0, k: [0, -20] }, r: { a: 0, k: 4 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.65, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Blade"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [12, 50] }, p: { a: 0, k: [0, 45] }, r: { a: 0, k: 6 } },
            { ty: "fl", c: { a: 0, k: [0.4, 0.3, 0.2, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Handle"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

// Trophy celebration animation
const trophyAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 150,
  h: 200,
  nm: "Trophy",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Trophy",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [5] },
            { t: 22, s: [5], e: [-5] },
            { t: 45, s: [-5], e: [5] },
            { t: 67, s: [5], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        p: { a: 0, k: [75, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100], e: [105, 105] },
            { t: 22, s: [105, 105], e: [100, 100] },
            { t: 45, s: [100, 100], e: [105, 105] },
            { t: 67, s: [105, 105], e: [100, 100] },
            { t: 90, s: [100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [60, 50] }, p: { a: 0, k: [0, -25] }, r: { a: 0, k: 8 } },
            { ty: "fl", c: { a: 0, k: [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Cup"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [15, 30] }, p: { a: 0, k: [0, 15] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.7, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stem"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [50, 12] }, p: { a: 0, k: [0, 35] }, r: { a: 0, k: 4 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.7, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Base"
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [-40, -25] } },
            { ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [40, -25] } },
            { ty: "fl", c: { a: 0, k: [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Handles"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Stars",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [100] },
            { t: 15, s: [100], e: [0] },
            { t: 30, s: [0], e: [100] },
            { t: 45, s: [100], e: [0] },
            { t: 60, s: [0], e: [100] },
            { t: 75, s: [100], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [75, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [-50, -60] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [50, -60] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, -80] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 4 }, is: { a: 0, k: 0 }, or: { a: 0, k: 10 }, os: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [1, 0.9, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stars Group"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

// Boundary celebration animation (ball hitting for six)
const boundaryAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Boundary",
  ddd: 0,
  assets: [],
  layers: [
    // Cricket Ball
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
            { t: 0, s: [0], e: [720] },
            { t: 45, s: [720], e: [1080] },
            { t: 90, s: [1080] }
          ]
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [30, 170], e: [100, 50] },
            { t: 30, s: [100, 50], e: [170, 170] },
            { t: 60, s: [170, 170], e: [100, 100] },
            { t: 90, s: [100, 100] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80], e: [120, 120] },
            { t: 45, s: [120, 120], e: [100, 100] },
            { t: 90, s: [100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [30, 30] }, p: { a: 0, k: [0, 0] } },
            { ty: "fl", c: { a: 0, k: [0.8, 0.1, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Ball Body"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [2, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 1 } },
            { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Seam"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Celebration sparkles
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Sparkles",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 30, s: [0], e: [100] },
            { t: 45, s: [100], e: [100] },
            { t: 75, s: [100], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 30, s: [50, 50], e: [150, 150] },
            { t: 60, s: [150, 150], e: [200, 200] },
            { t: 90, s: [200, 200] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [-40, -40] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [40, -40] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [-40, 40] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [40, 40] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 } },
            { ty: "sr", sy: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 4 }, is: { a: 0, k: 0 }, or: { a: 0, k: 10 }, os: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stars"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // SIX text
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Six Text",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 40, s: [0], e: [100] },
            { t: 50, s: [100], e: [100] },
            { t: 80, s: [100], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 40, s: [50, 50], e: [120, 120] },
            { t: 55, s: [120, 120], e: [100, 100] },
            { t: 70, s: [100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [60, 30] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
            { ty: "fl", c: { a: 0, k: [0.2, 0.7, 0.3, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Background"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

// Wicket falling animation (for unsold players)
const wicketFallingAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 150,
  h: 200,
  nm: "Wicket Fall",
  ddd: 0,
  assets: [],
  layers: [
    // Left stump falling
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Left Stump",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0] },
            { t: 20, s: [0], e: [-60] },
            { t: 50, s: [-60], e: [-90] },
            { t: 90, s: [-90] }
          ]
        },
        p: { a: 0, k: [50, 160] },
        a: { a: 0, k: [0, 60, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.65, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stump"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Center stump
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Center Stump",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0] },
            { t: 25, s: [0], e: [45] },
            { t: 55, s: [45], e: [90] },
            { t: 90, s: [90] }
          ]
        },
        p: { a: 0, k: [75, 160] },
        a: { a: 0, k: [0, 60, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.65, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stump"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Right stump
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Right Stump",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0] },
            { t: 30, s: [0], e: [70] },
            { t: 60, s: [70], e: [100] },
            { t: 90, s: [100] }
          ]
        },
        p: { a: 0, k: [100, 160] },
        a: { a: 0, k: [0, 60, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [8, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.65, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Stump"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Flying bails
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "Bails",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0] },
            { t: 15, s: [0], e: [180] },
            { t: 45, s: [180], e: [360] },
            { t: 90, s: [360] }
          ]
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [75, 95], e: [75, 95] },
            { t: 15, s: [75, 95], e: [75, 40] },
            { t: 45, s: [75, 40], e: [120, 180] },
            { t: 90, s: [120, 180] }
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
            { ty: "rc", d: 1, s: { a: 0, k: [30, 6] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.9, 0.75, 0.5, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Bail"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Ball hitting stumps
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: "Ball",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 30, s: [360] }
          ]
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [10, 120], e: [75, 100] },
            { t: 15, s: [75, 100], e: [140, 130] },
            { t: 40, s: [140, 130] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [80, 80, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] } },
            { ty: "fl", c: { a: 0, k: [0.8, 0.1, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Ball"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

// Cricket stadium animation
const stadiumAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 120,
  w: 200,
  h: 150,
  nm: "Stadium",
  ddd: 0,
  assets: [],
  layers: [
    // Stadium lights
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Lights",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [60], e: [100] },
            { t: 30, s: [100], e: [60] },
            { t: 60, s: [60], e: [100] },
            { t: 90, s: [100], e: [60] },
            { t: 120, s: [60] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 30] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [15, 15] }, p: { a: 0, k: [-60, 0] } },
            { ty: "el", s: { a: 0, k: [15, 15] }, p: { a: 0, k: [-30, -10] } },
            { ty: "el", s: { a: 0, k: [15, 15] }, p: { a: 0, k: [0, -15] } },
            { ty: "el", s: { a: 0, k: [15, 15] }, p: { a: 0, k: [30, -10] } },
            { ty: "el", s: { a: 0, k: [15, 15] }, p: { a: 0, k: [60, 0] } },
            { ty: "fl", c: { a: 0, k: [1, 0.95, 0.7, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Light Bulbs"
        }
      ],
      ip: 0,
      op: 120,
      st: 0
    },
    // Pitch
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Pitch",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [180, 60] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } },
            { ty: "fl", c: { a: 0, k: [0.2, 0.6, 0.3, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Field"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [40, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.85, 0.75, 0.6, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Strip"
        }
      ],
      ip: 0,
      op: 120,
      st: 0
    }
  ]
};

// Gavel animation for auction
const gavelAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 150,
  h: 150,
  nm: "Gavel",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Gavel",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-20], e: [20] },
            { t: 15, s: [20], e: [-20] },
            { t: 30, s: [-20], e: [20] },
            { t: 45, s: [20], e: [-20] },
            { t: 60, s: [-20] }
          ]
        },
        p: { a: 0, k: [75, 100] },
        a: { a: 0, k: [0, 30, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [50, 25] }, p: { a: 0, k: [0, -15] }, r: { a: 0, k: 4 } },
            { ty: "fl", c: { a: 0, k: [0.55, 0.35, 0.2, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Head"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [10, 50] }, p: { a: 0, k: [0, 20] }, r: { a: 0, k: 5 } },
            { ty: "fl", c: { a: 0, k: [0.4, 0.25, 0.15, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Handle"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    },
    // Sound block
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Block",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [75, 130] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [60, 15] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.35, 0.2, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Sound Block"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

interface AnimationProps {
  size?: number;
  className?: string;
  loop?: boolean;
}

export const StumpsAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={stumpsAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const BatSwingAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={batSwingAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const TrophyAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={trophyAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const BoundaryAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={boundaryAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const WicketFallingAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={wicketFallingAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const StadiumAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={stadiumAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);

export const GavelAnimation = ({ size = 100, className = "", loop = true }: AnimationProps) => (
  <Lottie animationData={gavelAnimation} loop={loop} style={{ width: size, height: size }} className={className} />
);
