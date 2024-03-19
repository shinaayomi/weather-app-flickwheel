import React from 'react'

type Props = {}

export default function getDayOrNightIcon(
  iconName:string, 
  dateTimeString:string
): string {
  const hours = new Date(dateTimeString).getHours() // Get hours from the given date and time string

  const isDayTime = hours >= 6 && hours < 8 // Consider day time from 6:00AM to 6:00PM

  return isDayTime ? iconName.replace(/.$/, 'd'):iconName.replace(/.$/, 'n')
}