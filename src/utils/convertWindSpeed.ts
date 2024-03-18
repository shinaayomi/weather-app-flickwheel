export default function convertWindSpeed(speedInMetersPerSecond: number):string {
  const speedInKilometersPerHour = speedInMetersPerSecond * 3.6 // convert from m/s to km/h
  return `${speedInKilometersPerHour.toFixed(0)}km/h` 
}