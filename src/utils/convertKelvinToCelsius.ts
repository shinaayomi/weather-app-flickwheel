import React from 'react'

type Props = {}

export default function convertKelvinToCelsius(tempInKelvin:number) :number{
  const tempInCelcius = tempInKelvin - 273.15

  return Math.floor(tempInCelcius) // remove decimal part and keeps integer part
}