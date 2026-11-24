import {
  GoalType,
  SexType,
  ActivityLevel,
  TrainingDays,
  UserProfile,
  DayPlan,
  PlanExercise,
  SiteProtocol,
  FoodItem,
  MealCategoryKey,
  QuickMealPreset,
  MonthCycleWeek,
} from '@/types';

export const MEASUREMENT_PROTOCOLS: SiteProtocol[] = [
  {
    key: 'neck',
    nameThai: 'รอบคอ',
    unit: 'cm',
    protocol: 'วัดใต้ลูกกระเดือก คอตั้งตรง ผ่อนคลายกล้ามเนื้อ ไม่เกร็งหรือรัดแน่น',
    requiredForNavy: true,
  },
  {
    key: 'chest',
    nameThai: 'รอบอก',
    unit: 'cm',
    protocol: 'ทาบสายวัดรอบจุดสูงสุดของหน้าอก ใต้รักแร้ วัดขณะหายใจออกปกติ',
  },
  {
    key: 'waist',
    nameThai: 'รอบเอว',
    unit: 'cm',
    protocol: 'จุดกึ่งกลางระหว่างซี่โครงล่างสุดและกระดูกเชิงกราน วัดขณะหายใจออกปกติ ไม่แขม่วพุง',
    requiredForNavy: true,
  },
  {
    key: 'hip',
    nameThai: 'รอบสะโพก',
    unit: 'cm',
    protocol: 'จุดที่กว้างที่สุดของสะโพกหรือก้น ยืนตรงส้นเท้าชิดกัน ผ่อนคลายกล้ามเนื้อ',
    requiredForNavy: true,
  },
  {
    key: 'arm',
    nameThai: 'รอบแขนซ้าย',
    unit: 'cm',
    protocol: 'กึ่งกลางระหว่างหัวไหล่และข้อศอก แขนปล่อยทิ้งข้างลำตัวอย่างผ่อนคลาย (ไม่เกร็ง)',
  },
  {
    key: 'thigh',
    nameThai: 'รอบต้นขาซ้าย',
    unit: 'cm',
    protocol: 'จุดกึ่งกลางระหว่างกระดูกสะโพกส่วนหน้าและหัวเข่า ยืนทิ้งน้ำหนักเท่ากันทั้งสองข้าง',
  },
  {
    key: 'height',
    nameThai: 'ส่วนสูง',
    unit: 'cm',
    protocol: 'ยืนตรง ไม่สวมรองเท้า ส้นเท้าและแผ่นหลังแนบผนัง ตั้งศีรษะมองตรง',
    requiredForNavy: true,
  },
  {
    key: 'weight',
    nameThai: 'น้ำหนักตัว',
    unit: 'kg',
    protocol: 'ชั่งตอนเช้าหลังตื่นนอนและขับถ่ายเสร็จ ก่อนรับประทานอาหารและน้ำ ดื่มน้ำในสภาวะปกติ',
  },
];

export const ASIAN_REFERENCE = {
  waist: {
    maleMax: 90,
    femaleMax: 80,
    note: 'เกณฑ์อ้างอิงรอบเอวประชากรเอเชีย (IDF/WHO): ชาย ≥90 cm, หญิง ≥80 cm',
  },
  waistToHip: {
    maleMax: 0.90,
    femaleMax: 0.85,
    note: 'เกณฑ์อ้างอิงสัดส่วนเอวต่อสะโพก (WHR): ชาย ≥0.90, หญิง ≥0.85',
  },
};

/**
 * Mifflin-St Jeor calculation:
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 * TDEE = BMR * activity
 * Goal: lose = -400, build = +250, maintain = 0
 * Floor at 1200 kcal
 */
export function calculateCalorieTarget(
  sex: SexType,
  weight: number,
  height: number,
  age: number,
  activity: ActivityLevel,
  goal: GoalType
): number {
  const bmrBase = 10 * weight + 6.25 * height - 5 * age;
  const bmr = sex === 'male' ? bmrBase + 5 : bmrBase - 161;
  const tdee = bmr * activity;

  let adjustment = 0;
  if (goal === 'lose') adjustment = -400;
  else if (goal === 'build') adjustment = 250;
  else adjustment = 0;

  const target = Math.round(tdee + adjustment);
  return Math.max(1200, target);
}

/**
 * Navy Body Fat %:
 * Male: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
 * Female: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
 * Returns null if missing prerequisites
 */
export function calculateNavyBodyFat(
  sex: SexType,
  height?: number,
  neck?: number,
  waist?: number,
  hip?: number
): number | null {
  if (!height || !neck || !waist) return null;
  if (sex === 'female' && !hip) return null;

  try {
    if (sex === 'male') {
      const diff = waist - neck;
      if (diff <= 0) return null;
      const denom =
        1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(height);
      const bf = 495 / denom - 450;
      if (isNaN(bf) || bf < 2 || bf > 60) return null;
      return Math.round(bf * 10) / 10;
    } else {
      const sum = waist + (hip || 0) - neck;
      if (sum <= 0) return null;
      const denom =
        1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(height);
      const bf = 495 / denom - 450;
      if (isNaN(bf) || bf < 4 || bf > 70) return null;
      return Math.round(bf * 10) / 10;
    }
  } catch {
    return null;
  }
}

// Built-in Exercise Pool with Swappable Alternatives & Technique Cues
export const EXERCISE_DATABASE: Record<
  string,
  { name: string; category: string; cue: string; alternatives: string[] }
> = {
  // Push / Chest
  bench_press: {
    name: 'Barbell Bench Press (นอนดันบาร์เบล)',
    category: 'อก/ดัน',
    cue: 'บีบสะบักแนบเบาะ ทิ้งบาร์ระดับราวนม ดันขึ้นเป็นเส้นโค้งเบาๆ',
    alternatives: ['Dumbbell Press (ดัมเบลนอนดัน)', 'Push-ups (วิดพื้นตามบอดี้เวท)', 'Machine Chest Press (เครื่องดันอก)'],
  },
  incline_db_press: {
    name: 'Incline Dumbbell Press (ดัมเบลดันอกบน)',
    category: 'อก/ดัน',
    cue: 'ปรับเบาะ 30–45 องศา ดันดัมเบลขึ้นตรงโดยข้อศอกไม่กางเกินไป',
    alternatives: ['Incline Barbell Press', 'Low-to-High Cable Fly', 'Feet-Elevated Push-ups'],
  },
  overhead_press: {
    name: 'Overhead Press (บาร์เบลยืนดันเหนือศีรษะ)',
    category: 'ไหล่/ดัน',
    cue: 'เกร็งหน้าท้องและบั้นท้าย ดันบาร์ผ่านหน้าผากแล้วล็อกแขนเหนือศีรษะ',
    alternatives: ['Dumbbell Shoulder Press (ดัมเบลดันไหล่)', 'Pike Push-ups', 'Arnold Press'],
  },
  lateral_raise: {
    name: 'Dumbbell Lateral Raise (กางแขนยกไหล่ข้าง)',
    category: 'ไหล่',
    cue: 'งอข้อศอกเล็กน้อย ยกขึ้นขนานพื้น ไม่เหวี่ยงลำตัว ใช้กล้ามเนื้อไหล่ข้างคุมจังหวะลง',
    alternatives: ['Cable Lateral Raise', 'Face Pulls', 'Resistance Band Lateral Raise'],
  },
  tricep_pushdown: {
    name: 'Triceps Pushdown (เคเบิลดันหลังแขน)',
    category: 'แขน/ดัน',
    cue: 'ล็อกข้อศอกแนบข้างลำตัว ดันเคเบิลลงจนแขนเหยียดตรง เกร็งหลังแขน 1 วินาที',
    alternatives: ['Overhead Dumbbell Extension', 'Dips (ดิปส์)', 'Diamond Push-ups'],
  },

  // Pull / Back
  barbell_row: {
    name: 'Barbell Bent-over Row (ก้มดึงบาร์เบล)',
    category: 'หลัง/ดึง',
    cue: 'พับสะโพกหลังตรง 45 องศา ดึงบาร์เข้าสู่สะดือ บีบสะบักเข้าหากัน',
    alternatives: ['Dumbbell Single-arm Row (ดัมเบลดึงทีละข้าง)', 'Chest-supported Row', 'Seated Cable Row'],
  },
  lat_pulldown: {
    name: 'Lat Pulldown (ดึงสายเคเบิลลงหลังกว้าง)',
    category: 'หลัง/ดึง',
    cue: 'ดึงบาร์ลงหากระดูกไหปลาร้า เปิดอก ไม่เอี้ยวตัวไปข้างหลังมากเกินไป',
    alternatives: ['Pull-ups (โหนบาร์ดึงข้อ)', 'Resistance Band Pulldown', 'Straight-arm Pulldown'],
  },
  seated_cable_row: {
    name: 'Seated Cable Row (นั่งดึงเคเบิลเข้าท้อง)',
    category: 'หลัง/ดึง',
    cue: 'ยืดหลังตรง ปล่อยสะบักยืดสุดตอนคลาย แล้วดึงเข้าเอวพร้อมบีบสะบักแน่น',
    alternatives: ['Inverted Row', 'T-Bar Row', 'Dumbbell Row'],
  },
  bicep_curl: {
    name: 'Barbell / Dumbbell Curl (ยืนยกต้นแขนหน้า)',
    category: 'แขน/ดึง',
    cue: 'ข้อศอกอยู่นิ่ง ไม่เหวี่ยง ยกขึ้นบีบหน้าแขน แล้วผ่อนลงช้าๆ 2-3 วินาที',
    alternatives: ['Hammer Curl (ดัมเบลคว่ำมือยก)', 'Incline Dumbbell Curl', 'Cable Bicep Curl'],
  },

  // Legs
  barbell_squat: {
    name: 'Barbell Back Squat (สควอทบาร์เบล)',
    category: 'ขา/แกนกลาง',
    cue: 'ยืนกว้างระดับหัวไหล่ ดันสะโพกไปข้างหลัง ย่อเข่าจนต้นขาขนานพื้น ล็อกแกนกลาง',
    alternatives: ['Goblet Squat (ดัมเบลถืออกสควอท)', 'Leg Press (เครื่องถีบขา)', 'Bulgarian Split Squat'],
  },
  romanian_deadlift: {
    name: 'Romanian Deadlift (บาร์เบลพับสะโพกหลังขา)',
    category: 'หลังขา/สะโพก',
    cue: 'งอเข่าเล็กน้อยคงที่ พับสะโพกไปข้างหลังจนรู้สึกตึงหลังขา ดันสะโพกกลับมาตรง',
    alternatives: ['Dumbbell RDL (ดัมเบลพับสะโพก)', 'Seated Leg Curl', 'Glute Bridge / Hip Thrust'],
  },
  leg_press: {
    name: 'Leg Press (เครื่องถีบขา)',
    category: 'ขา',
    cue: 'วางเท้ากลางแท่น ย่อเข่าจนทำมุม 90 องศา ถีบขึ้นโดยไม่ล็อกหัวเข่าจนสุด',
    alternatives: ['Walking Lunges (ก้าวเดินย่อตัว)', 'Hack Squat', 'Goblet Squat'],
  },
  leg_curl: {
    name: 'Lying / Seated Leg Curl (งอเข่าพับหลังขา)',
    category: 'หลังขา',
    cue: 'เกร็งพับส้นเท้าเข้าหาบั้นท้าย ควบคุมจังหวะเหยียดออกช้าๆ',
    alternatives: ['Nordic Hamstring Curl', 'Swiss Ball Leg Curl', 'Stiff-leg Deadlift'],
  },
  calf_raise: {
    name: 'Standing Calf Raise (เขย่งปลายเท้าฝึกน่อง)',
    category: 'น่อง',
    cue: 'เขย่งบนปลายเท้าให้สูงที่สุด ค้าง 1 วินาที ยืดส้นเท้าลงต่ำกว่าระดับก้าว',
    alternatives: ['Seated Calf Raise', 'Single-leg Calf Raise'],
  },
  plank: {
    name: 'Forearm Plank (แพลงก์เกร็งหน้าท้อง)',
    category: 'แกนกลางลำตัว',
    cue: 'เกร็งหน้าท้อง ขมิบบั้นท้าย ลำตัวเป็นเส้นตรง ไม่หย่อนหรือโก่งหลัง',
    alternatives: ['Hollow Body Hold', 'Dead Bug', 'Ab Wheel Rollout'],
  },
};

/**
 * Weekly Plan Generator by strict rule:
 * - 3 days: Full Body A / B / C
 * - 4 days: Upper / Lower (Upper A, Lower A, Upper B, Lower B)
 * - 5 days: Push / Pull / Legs then Upper / Lower
 */
export function generateWeeklyPlan(days: TrainingDays, goal: GoalType): DayPlan[] {
  let sets = 3;
  let reps = '10–12 ครั้ง';
  let restSec = 60;

  if (goal === 'build') {
    sets = 4;
    reps = '6–10 ครั้ง';
    restSec = 120;
  } else if (goal === 'maintain') {
    sets = 3;
    reps = '8–12 ครั้ง';
    restSec = 90;
  }

  const makeEx = (key: string): PlanExercise => {
    const ex = EXERCISE_DATABASE[key];
    return {
      id: key,
      name: ex.name,
      category: ex.category,
      targetSets: sets,
      targetReps: reps,
      restSec: restSec,
      cue: ex.cue,
      alternatives: ex.alternatives,
    };
  };

  const dayNames = [
    { thai: 'วันจันทร์', short: 'จ.' },
    { thai: 'วันอังคาร', short: 'อ.' },
    { thai: 'วันพุธ', short: 'พ.' },
    { thai: 'วันพฤหัสบดี', short: 'พฤ.' },
    { thai: 'วันศุกร์', short: 'ศ.' },
    { thai: 'วันเสาร์', short: 'ส.' },
    { thai: 'วันอาทิตย์', short: 'อา.' },
  ];

  if (days === 3) {
    return [
      {
        dayIndex: 0,
        dayNameThai: dayNames[0].thai,
        dayShortThai: dayNames[0].short,
        isRest: false,
        workoutTitle: 'ทั่วร่าง A (Full Body A)',
        description: 'เน้นอก ขาหน้า หลังส่วนกว้าง และแกนกลาง',
        focusMuscle: 'อก, ขาหน้า, หลังกว้าง, แกนกลาง',
        durationMin: 50,
        exercises: [
          makeEx('barbell_squat'),
          makeEx('bench_press'),
          makeEx('lat_pulldown'),
          makeEx('lateral_raise'),
          makeEx('plank'),
        ],
      },
      {
        dayIndex: 1,
        dayNameThai: dayNames[1].thai,
        dayShortThai: dayNames[1].short,
        isRest: true,
        workoutTitle: 'วันพักฟื้น (Rest & Recovery)',
        description: 'พักผ่อน ยืดเหยียดเบาๆ และดื่มน้ำให้เพียงพอ',
        focusMuscle: 'พักกล้ามเนื้อ / ฟื้นฟูระบบประสาท',
        durationMin: 0,
        exercises: [],
      },
      {
        dayIndex: 2,
        dayNameThai: dayNames[2].thai,
        dayShortThai: dayNames[2].short,
        isRest: false,
        workoutTitle: 'ทั่วร่าง B (Full Body B)',
        description: 'เน้นหลังขา พับสะโพก บ่าไหล่ และหลังกลาง',
        focusMuscle: 'สะโพก, หลังขา, ไหล่, หลังกลาง',
        durationMin: 50,
        exercises: [
          makeEx('romanian_deadlift'),
          makeEx('overhead_press'),
          makeEx('barbell_row'),
          makeEx('leg_press'),
          makeEx('bicep_curl'),
        ],
      },
      {
        dayIndex: 3,
        dayNameThai: dayNames[3].thai,
        dayShortThai: dayNames[3].short,
        isRest: true,
        workoutTitle: 'วันพักฟื้น (Rest & Recovery)',
        description: 'ฟื้นฟูกล้ามเนื้อ พักสายตา และนอนหลับเต็มอิ่ม',
        focusMuscle: 'พักผ่อน / ดื่มน้ำ',
        durationMin: 0,
        exercises: [],
      },
      {
        dayIndex: 4,
        dayNameThai: dayNames[4].thai,
        dayShortThai: dayNames[4].short,
        isRest: false,
        workoutTitle: 'ทั่วร่าง C (Full Body C)',
        description: 'เน้นการเคลื่อนไหวรวม อกบน หลังส่วนล่าง แขนและน่อง',
        focusMuscle: 'อกบน, แขน, หลัง, น่อง',
        durationMin: 50,
        exercises: [
          makeEx('barbell_squat'),
          makeEx('incline_db_press'),
          makeEx('seated_cable_row'),
          makeEx('tricep_pushdown'),
          makeEx('calf_raise'),
        ],
      },
      {
        dayIndex: 5,
        dayNameThai: dayNames[5].thai,
        dayShortThai: dayNames[5].short,
        isRest: true,
        workoutTitle: 'วันพักผ่อนสุดสัปดาห์ (Active Weekend)',
        description: 'เดินเล่นสบายๆ รับอากาศบริสุทธิ์ ยืดเหยียด',
        focusMuscle: 'ยืดเหยียดเบาๆ',
        durationMin: 0,
        exercises: [],
      },
      {
        dayIndex: 6,
        dayNameThai: dayNames[6].thai,
        dayShortThai: dayNames[6].short,
        isRest: true,
        workoutTitle: 'วันพักผ่อนและเตรียมสัปดาห์ใหม่',
        description: 'เตรียมตัวสู่สัปดาห์การฝึกถัดไปอย่างสดชื่น',
        focusMuscle: 'ฟื้นฟูเต็มรูปแบบ',
        durationMin: 0,
        exercises: [],
      },
    ];
  }

  if (days === 4) {
    return [
      {
        dayIndex: 0,
        dayNameThai: dayNames[0].thai,
        dayShortThai: dayNames[0].short,
        isRest: false,
        workoutTitle: 'ช่วงบน A (Upper A)',
        description: 'เน้นแรงดันอก หลังดึงกว้าง และไหล่',
        focusMuscle: 'อก, หลังกว้าง, ไหล่, หลังแขน',
        durationMin: 45,
        exercises: [
          makeEx('bench_press'),
          makeEx('lat_pulldown'),
          makeEx('overhead_press'),
          makeEx('barbell_row'),
          makeEx('tricep_pushdown'),
        ],
      },
      {
        dayIndex: 1,
        dayNameThai: dayNames[1].thai,
        dayShortThai: dayNames[1].short,
        isRest: false,
        workoutTitle: 'ช่วงล่าง A (Lower A)',
        description: 'เน้นกำลังขาหน้า ควอดริเซปส์ และน่อง',
        focusMuscle: 'ต้นขาหน้า, สะโพก, น่อง, แกนกลาง',
        durationMin: 45,
        exercises: [
          makeEx('barbell_squat'),
          makeEx('romanian_deadlift'),
          makeEx('leg_press'),
          makeEx('calf_raise'),
          makeEx('plank'),
        ],
      },
      {
        dayIndex: 2,
        dayNameThai: dayNames[2].thai,
        dayShortThai: dayNames[2].short,
        isRest: true,
        workoutTitle: 'วันพักคั่นกลาง (Midweek Rest)',
        description: 'ฟื้นฟูกล้ามเนื้อและระบบประสาทส่วนกลาง',
        focusMuscle: 'ฟื้นฟูกล้ามเนื้อ',
        durationMin: 0,
        exercises: [],
      },
      {
        dayIndex: 3,
        dayNameThai: dayNames[3].thai,
        dayShortThai: dayNames[3].short,
        isRest: false,
        workoutTitle: 'ช่วงบน B (Upper B)',
        description: 'เน้นอกบน หลังดึงแนวนอน และแขน',
        focusMuscle: 'อกบน, หลังกลาง, แขนหน้า, แขนหลัง',
        durationMin: 45,
        exercises: [
          makeEx('incline_db_press'),
          makeEx('seated_cable_row'),
          makeEx('lateral_raise'),
          makeEx('bicep_curl'),
          makeEx('tricep_pushdown'),
        ],
      },
      {
        dayIndex: 4,
        dayNameThai: dayNames[4].thai,
        dayShortThai: dayNames[4].short,
        isRest: false,
        workoutTitle: 'ช่วงล่าง B (Lower B)',
        description: 'เน้นหลังขา สะโพก และแกนกลาง',
        focusMuscle: 'หลังขา, สะโพก, หน้าท้อง',
        durationMin: 45,
        exercises: [
          makeEx('romanian_deadlift'),
          makeEx('leg_press'),
          makeEx('leg_curl'),
          makeEx('calf_raise'),
          makeEx('plank'),
        ],
      },
      {
        dayIndex: 5,
        dayNameThai: dayNames[5].thai,
        dayShortThai: dayNames[5].short,
        isRest: true,
        workoutTitle: 'วันพักผ่อนสุดสัปดาห์ (Weekend Rest)',
        description: 'พักผ่อน ร่างกายซ่อมแซมกล้ามเนื้อ',
        focusMuscle: 'พักฟื้นกล้ามเนื้อ',
        durationMin: 0,
        exercises: [],
      },
      {
        dayIndex: 6,
        dayNameThai: dayNames[6].thai,
        dayShortThai: dayNames[6].short,
        isRest: true,
        workoutTitle: 'วันพักเตรียมพร้อมสัปดาห์ใหม่',
        description: 'นอนหลับให้เพียงพอเพื่อฟื้นกำลัง',
        focusMuscle: 'พักผ่อนเต็มอิ่ม',
        durationMin: 0,
        exercises: [],
      },
    ];
  }

  // 5 days
  return [
    {
      dayIndex: 0,
      dayNameThai: dayNames[0].thai,
      dayShortThai: dayNames[0].short,
      isRest: false,
      workoutTitle: 'ผลัก / ดัน (Push Day)',
      description: 'กล้ามเนื้อกลุ่มดัน: อก ไหล่ และหลังแขน',
      focusMuscle: 'อก, ไหล่หน้า/ข้าง, หลังแขน',
      durationMin: 50,
      exercises: [
        makeEx('bench_press'),
        makeEx('incline_db_press'),
        makeEx('overhead_press'),
        makeEx('lateral_raise'),
        makeEx('tricep_pushdown'),
      ],
    },
    {
      dayIndex: 1,
      dayNameThai: dayNames[1].thai,
      dayShortThai: dayNames[1].short,
      isRest: false,
      workoutTitle: 'ดึง (Pull Day)',
      description: 'กล้ามเนื้อกลุ่มดึง: หลัง ปีก และหน้าแขน',
      focusMuscle: 'ปีกหลัง, หลังกลาง, ไหล่หลัง, แขนหน้า',
      durationMin: 50,
      exercises: [
        makeEx('lat_pulldown'),
        makeEx('barbell_row'),
        makeEx('seated_cable_row'),
        makeEx('lateral_raise'),
        makeEx('bicep_curl'),
      ],
    },
    {
      dayIndex: 2,
      dayNameThai: dayNames[2].thai,
      dayShortThai: dayNames[2].short,
      isRest: false,
      workoutTitle: 'ขาและแกนกลาง (Legs Day)',
      description: 'ต้นขาหน้า หลังขา น่อง และหน้าท้อง',
      focusMuscle: 'ควอดริเซปส์, แฮมสตริง, น่อง, ท้อง',
      durationMin: 50,
      exercises: [
        makeEx('barbell_squat'),
        makeEx('romanian_deadlift'),
        makeEx('leg_press'),
        makeEx('leg_curl'),
        makeEx('calf_raise'),
      ],
    },
    {
      dayIndex: 3,
      dayNameThai: dayNames[3].thai,
      dayShortThai: dayNames[3].short,
      isRest: true,
      workoutTitle: 'วันพักฟื้นตัว (Midweek Rest)',
      description: 'พักผ่อน ร่างกายได้ฟื้นฟูหลังการฝึก 3 วันติด',
      focusMuscle: 'พักระบบประสาท / กล้ามเนื้อ',
      durationMin: 0,
      exercises: [],
    },
    {
      dayIndex: 4,
      dayNameThai: dayNames[4].thai,
      dayShortThai: dayNames[4].short,
      isRest: false,
      workoutTitle: 'ช่วงบนเสริม (Upper Body)',
      description: 'รวบรวมกลุ่มกล้ามเนื้อช่วงบนเพื่อความสมดุล',
      focusMuscle: 'อก, หลัง, ไหล่, แขน',
      durationMin: 45,
      exercises: [
        makeEx('bench_press'),
        makeEx('barbell_row'),
        makeEx('overhead_press'),
        makeEx('bicep_curl'),
        makeEx('tricep_pushdown'),
      ],
    },
    {
      dayIndex: 5,
      dayNameThai: dayNames[5].thai,
      dayShortThai: dayNames[5].short,
      isRest: false,
      workoutTitle: 'ช่วงล่างเสริม (Lower Body)',
      description: 'กระตุ้นกล้ามเนื้อช่วงล่างรอบที่สองของสัปดาห์',
      focusMuscle: 'ขาหน้า, สะโพก, น่อง, แกนกลาง',
      durationMin: 45,
      exercises: [
        makeEx('barbell_squat'),
        makeEx('romanian_deadlift'),
        makeEx('leg_press'),
        makeEx('calf_raise'),
        makeEx('plank'),
      ],
    },
    {
      dayIndex: 6,
      dayNameThai: dayNames[6].thai,
      dayShortThai: dayNames[6].short,
      isRest: true,
      workoutTitle: 'วันพักผ่อนเต็มวัน (Full Recovery)',
      description: 'พักผ่อนพร้อมรับสัปดาห์ถัดไปอย่างเต็มที่',
      focusMuscle: 'พักผ่อนฟื้นฟูเต็มวัน',
      durationMin: 0,
      exercises: [],
    },
  ];
}

/**
 * 4-Week Mesocycle Generator for the Monthly Plan
 */
export function generateMonthPlan(days: TrainingDays, goal: GoalType): MonthCycleWeek[] {
  const baseWeekly = generateWeeklyPlan(days, goal);

  return [
    {
      weekNumber: 1,
      title: 'สัปดาห์ที่ 1: สร้างฐานความแข็งแรง',
      subtitle: 'ปรับฟอร์มการยกและสร้างความคุ้นเคยกับการควบคุมกล้ามเนื้อ (RPE 6–7)',
      phase: 'foundation',
      badge: 'Foundation Phase',
      days: baseWeekly,
    },
    {
      weekNumber: 2,
      title: 'สัปดาห์ที่ 2: สะสมปริมาตรการฝึก',
      subtitle: 'เพิ่มน้ำหนักหรือจำนวนครั้งอย่างแม่นยำ กระตุ้นการสังเคราะห์โปรตีน (RPE 7–8)',
      phase: 'volume',
      badge: 'Volume Phase',
      days: baseWeekly,
    },
    {
      weekNumber: 3,
      title: 'สัปดาห์ที่ 3: พีคความเข้มข้นสูงสุด',
      subtitle: 'ท้าทายขีดจำกัดด้วยน้ำหนักเป้าหมายสูงสุดของเดือน (RPE 8.5–9)',
      phase: 'intensity',
      badge: 'Peak Phase',
      days: baseWeekly,
    },
    {
      weekNumber: 4,
      title: 'สัปดาห์ที่ 4: ฟื้นฟูสภาพร่างกาย (Deload)',
      subtitle: 'ลดปริมาตรการฝึกลง 30% เพื่อให้เส้นเอ็น ข้อต่อ และประสาทส่วนกลางฟื้นคืน 100%',
      phase: 'deload',
      badge: 'Deload & Recovery',
      days: baseWeekly,
    },
  ];
}

/**
 * Quick meal presets by category for 1-tap logging and photo check
 */
export const QUICK_MEAL_PRESETS: Record<MealCategoryKey, QuickMealPreset[]> = {
  เช้า: [
    { name: 'โจ๊กหมูสับใส่ไข่ลวกขิงซอย', calories: 320, protein: 20, carbs: 42, fat: 8, mealType: 'เช้า' },
    { name: 'ข้าวกล้อง + ไข่ต้ม 2 ฟอง', calories: 280, protein: 18, carbs: 36, fat: 8, mealType: 'เช้า' },
    { name: 'แซนด์วิชทูน่าโฮลวีต', calories: 310, protein: 24, carbs: 32, fat: 7, mealType: 'เช้า' },
    { name: 'อเมริกาโน่เย็นไม่หวาน', calories: 15, protein: 1, carbs: 2, fat: 0, mealType: 'เช้า' },
  ],
  กลางวัน: [
    { name: 'ข้าวกะเพราอกไก่ไข่ดาวน้ำ', calories: 460, protein: 38, carbs: 52, fat: 9, mealType: 'กลางวัน' },
    { name: 'ก๋วยเตี๋ยวต้มยำน้ำใสอกไก่ฉีก', calories: 360, protein: 28, carbs: 48, fat: 5, mealType: 'กลางวัน' },
    { name: 'ข้าวราดผัดผักรวมใส่กุ้ง', calories: 380, protein: 26, carbs: 50, fat: 6, mealType: 'กลางวัน' },
    { name: 'สุกี้น้ำอกไก่ไม่ใส่วุ้นเส้น', calories: 290, protein: 34, carbs: 18, fat: 4, mealType: 'กลางวัน' },
  ],
  เย็น: [
    { name: 'ข้าวอกไก่ย่างน้ำจิ้มแจ่วพร้อมผักลวก', calories: 410, protein: 42, carbs: 45, fat: 6, mealType: 'เย็น' },
    { name: 'สลัดทูน่าในน้ำแร่และไข่ต้ม', calories: 280, protein: 32, carbs: 12, fat: 7, mealType: 'เย็น' },
    { name: 'สเต็กปลาแซลมอนย่างเกลือและหน่อไม้ฝรั่ง', calories: 430, protein: 36, carbs: 10, fat: 22, mealType: 'เย็น' },
    { name: 'ต้มยำกุ้งน้ำใสและข้าวสวย 1 ทัพพี', calories: 310, protein: 25, carbs: 38, fat: 4, mealType: 'เย็น' },
  ],
  ของว่าง: [
    { name: 'เวย์โปรตีนไอโซเลต 1 สกู๊ป', calories: 130, protein: 27, carbs: 2, fat: 1, mealType: 'ของว่าง' },
    { name: 'กรีกโยเกิร์ตราดน้ำผึ้งและอัลมอนด์', calories: 220, protein: 16, carbs: 22, fat: 7, mealType: 'ของว่าง' },
    { name: 'กล้วยหอม 1 ผล', calories: 105, protein: 1, carbs: 27, fat: 0, mealType: 'ของว่าง' },
    { name: 'อัลมอนด์อบธรรมชาติ 20 เม็ด', calories: 160, protein: 6, carbs: 6, fat: 14, mealType: 'ของว่าง' },
  ],
};

/**
 * Sample food pool for stub analyzeFood()
 */
export const SAMPLE_FOOD_POOL = [
  {
    name: 'ข้าวกะเพราอกไก่ไข่ดาวไม่ใส่น้ำมัน',
    calories: 460,
    protein: 38,
    carbs: 52,
    fat: 9,
    mealType: 'กลางวัน' as const,
    isUnsure: false,
  },
  {
    name: 'ข้าวอกไก่ย่างน้ำจิ้มแจ่วพร้อมผักลวก',
    calories: 410,
    protein: 42,
    carbs: 45,
    fat: 6,
    mealType: 'เย็น' as const,
    isUnsure: false,
  },
  {
    name: 'โจ๊กหมูสับใส่ไข่ลวกขิงซอย',
    calories: 320,
    protein: 20,
    carbs: 42,
    fat: 8,
    mealType: 'เช้า' as const,
    isUnsure: false,
  },
  {
    name: 'ก๋วยเตี๋ยวต้มยำน้ำใสอกไก่ฉีก',
    calories: 360,
    protein: 28,
    carbs: 48,
    fat: 5,
    mealType: 'กลางวัน' as const,
    isUnsure: true, // triggers "ควรตรวจชื่อ"
  },
  {
    name: 'สลัดทูน่าในน้ำแร่และไข่ต้ม',
    calories: 280,
    protein: 32,
    carbs: 12,
    fat: 7,
    mealType: 'เย็น' as const,
    isUnsure: false,
  },
  {
    name: 'กรีกโยเกิร์ตราดน้ำผึ้งและอัลมอนด์',
    calories: 220,
    protein: 16,
    carbs: 22,
    fat: 7,
    mealType: 'ของว่าง' as const,
    isUnsure: false,
  },
];

/**
 * Stub food analyzer with brief simulated latency
 */
export async function analyzeFood(imageFile?: File | string): Promise<{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealCategoryKey;
  isUnsure: boolean;
}> {
  await new Promise((resolve) => setTimeout(resolve, 380));
  const randomIndex = Math.floor(Math.random() * SAMPLE_FOOD_POOL.length);
  return SAMPLE_FOOD_POOL[randomIndex];
}
