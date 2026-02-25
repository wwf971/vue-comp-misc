export function format_date(time_stamp, time_zone) {
  if (time_zone === undefined) {
    time_zone = get_local_timezone_int()
  }

  const localMillis = time_stamp / 1000 + time_zone * 3600 * 1000
  const date = new Date(localMillis)

  const pad = (n) => n.toString().padStart(2, '0')

  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hour = pad(date.getUTCHours())
  const minute = pad(date.getUTCMinutes())
  const second = pad(date.getUTCSeconds())

  const tzSign = time_zone >= 0 ? '+' : '-'
  const tz = `UTC${tzSign}${Math.abs(time_zone).toString().padStart(2, '0')}`

  return `${year}-${month}-${day} ${hour}:${minute}:${second}${tz}`
}

export function get_local_timezone_int() {
  return new Date().getTimezoneOffset() * -1
}

export function get_cookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}
