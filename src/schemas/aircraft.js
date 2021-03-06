const Joi = require('@hapi/joi');
const MAX_VALID_SEEN = 10;

/**
 * Define a custom type `altitude`, which allows numbers or a string
 * equal to "ground" which it will coerce to 0
 */
const Joi1090 = Joi.extend(joi => {
  return {
    type: 'altitude',
    base: joi.alternatives().try(Joi.number(), Joi.string().valid('ground')),
    coerce (value, helpers) {
      if (value === 'ground') {
        return { value: 0 };
      }
    }
  };
});

// https://github.com/flightaware/dump1090/blob/master/README-json.md
const AIRCRAFT_SCHEMA = Joi1090.object({
  hex: Joi1090.string().required(), // 24-bit ICAO identifier, unique to each aircraft
  flight: Joi1090.string().trim().required(), // callsign
  lat: Joi1090.number().required(), // latitude in decimal degrees
  lon: Joi1090.number().required(), // longitude in decimal degrees
  alt_baro: Joi1090.altitude().optional(), // barometric altitude (feet), which may be the string 'ground'
  track: Joi1090.number().optional(), // true track over ground (degrees 0-359)
  true_heading: Joi1090.number().optional(), // heading, degrees clockwise from true north
  seen: Joi1090.number().max(MAX_VALID_SEEN).required(), // max allowed seconds for an aircraft to be considered valid
  seen_pos: Joi1090.number().optional(), // how long ago in seconds position was last updated
  error: Joi1090.boolean().forbidden().default(false), // if there is a validation error
  updated: Joi1090.number().required(), // last time aircraft was updated (always generated by serve1090)
  messages: Joi1090.number().optional(), // number of Mode S messages received from aircraft
  type: Joi1090.string().optional(), // type of message (ADSB vs TISB, etc)
  alt_geom: Joi1090.altitude().optional(), // geometric altitude (feet)
  gs: Joi1090.number().optional(), // groundspeed (knots)
  ias: Joi1090.number().optional(), // indicated airspeed (knots)
  tas: Joi1090.number().optional(), // true airspeed (knots)
  mach: Joi1090.number().optional(), // mach number
  track_rate: Joi1090.number().optional(), // rate of change of track, degrees/second
  roll: Joi1090.number().optional(), // roll, degrees, negative if left roll
  mag_heading: Joi1090.number().optional(), // heading, degrees clockwise from magnetic north
  baro_rate: Joi1090.number().optional(), // rate of change of barometric altitude, feet/minute
  geom_rate: Joi1090.number().optional(), // rate of change of geometric altitude, feet/minute
  squawk: Joi1090.string().optional(), // Mode A code / squawk (octal digits)
  emergency: Joi1090.string().optional(), // ADS-B emergency status
  category: Joi1090.string().optional(), // aircraft emitter category
  nav_qnh: Joi1090.number().optional(), // altimeter setting
  nav_altitude_mcp: Joi1090.number().optional(), // MCP/FCU selected altitude
  nav_altitude_fms: Joi1090.number().optional(), // FMS selected altitude
  nav_heading: Joi1090.number().optional(), // selected heading
  nav_modes: Joi1090.array().items(Joi1090.string()).optional(), // set of engaged automation modes
  nic: Joi1090.number().optional(), // navigation integrity category
  rc: Joi1090.number().optional(), // radius of containment
  version: Joi1090.number().optional(), // ADS-B version number [0, 1, 2]
  nic_baro: Joi1090.number().optional(), // NIC for barometric altitude
  nac_p: Joi1090.number().optional(), // navigation accuracy for position
  nac_v: Joi1090.number().optional(), // navigation accuracy for velocity
  sil: Joi1090.number().optional(), // source integrity level
  sil_type: Joi1090.string().optional(), // interpretation of SIL (unknown, perhour, persample)
  gva: Joi1090.number().optional(), // geometric vertical accuracy
  sda: Joi1090.number().optional(), // system design assurance
  mlat: Joi.array().items(Joi1090.string()).optional(), // list of fields derived from MLAT
  tisb: Joi.array().items(Joi1090.string()).optional(), // list of fields derived from TISB
  rssi: Joi1090.number().optional() // recent verage RSSI (signal power) (dbFS) (always negative)
}).options({ stripUnknown: true });

module.exports = AIRCRAFT_SCHEMA;