import axios from 'axios'

export const sendRequest = async (deviceId, arg) => {
  const url = `https://api.particle.io/v1/devices/${deviceId}/lockFn`
  const token = process.env.PARTICLE_API_KEY
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const response = await axios.post(url, `arg=${arg}`, config)
  console.log(response.data)
}
