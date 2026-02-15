// I'm implementing your 1-5 Warmth Scale logic here [cite: 93-95]
export const getRequiredWarmth = (temp) => {
  if (temp < 10) return 5; // Heavy [cite: 95]
  if (temp < 15) return 4; // Warm 
  if (temp < 20) return 3; // Medium 
  if (temp < 25) return 2; // Light [cite: 93]
  return 1;                // Very Light [cite: 93]
};

export const generateVaraOutfit = (closet, currentTemp, targetOccasion) => {
  const targetWarmth = getRequiredWarmth(currentTemp);

  // Filter 1: Must be clean (!isDirty) [cite: 49, 50]
  // Filter 2: Must match the occasion [cite: 96, 97]
  // Filter 3: Must match the warmth level [cite: 93-95]
  
  const possibleTops = closet.filter(item => 
    item.category === 'top' && 
    !item.isDirty && 
    item.occasion === targetOccasion &&
    item.warmth === targetWarmth
  );

  const possibleBottoms = closet.filter(item => 
    item.category === 'bottom' && 
    !item.isDirty && 
    item.occasion === targetOccasion &&
    (item.warmth >= targetWarmth - 1 && item.warmth <= targetWarmth)
  );

  // Picking a random match from the filtered list [cite: 57]
  const top = possibleTops[Math.floor(Math.random() * possibleTops.length)];
  const bottom = possibleBottoms[Math.floor(Math.random() * possibleBottoms.length)];

  return { top, bottom };
};