
export default function metersToKilometers(visibilityInMeters: number):string {
  const visibilityInKilometers = visibilityInMeters / 1000
  return `${visibilityInKilometers.toFixed(0)}km` // Rounde to decimal places and add to 'km' unit
}