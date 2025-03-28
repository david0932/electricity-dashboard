let reconnectTimer = null

// MQTT packet encoding helper functions
function encodeLength(length) {
  const bytes = []
  do {
    let byte = length & 0x7F
    length = length >> 7
    if (length > 0) byte = byte | 0x80
    bytes.push(byte)
  } while (length > 0)
  return bytes
}

function encodeString(str) {
  const strBytes = new TextEncoder().encode(str)
  const lenBytes = [(strBytes.length >> 8) & 0xFF, strBytes.length & 0xFF]
  return new Uint8Array([...lenBytes, ...strBytes])
}

function encodeConnectPacket(clientId) {
  // Fixed header
  const type = 1 // CONNECT
  const flags = 0 // No flags
  
  // Variable header
  const protocolName = encodeString('MQTT')
  const protocolLevel = new Uint8Array([4]) // MQTT 3.1.1
  const connectFlags = new Uint8Array([2]) // Clean session
  const keepAlive = new Uint8Array([0, 60]) // 60 seconds
  
  // Payload
  const encodedClientId = encodeString(clientId)
  
  // Calculate remaining length
  const remainingLength = protocolName.length + 1 + 1 + 2 + encodedClientId.length
  const remainingLengthBytes = encodeLength(remainingLength)
  
  // Combine all parts
  return new Uint8Array([
    (type << 4) | flags,
    ...remainingLengthBytes,
    ...protocolName,
    ...protocolLevel,
    ...connectFlags,
    ...keepAlive,
    ...encodedClientId
  ])
}

function encodeSubscribePacket(messageId, topic) {
  // Fixed header
  const type = 8 // SUBSCRIBE
  const flags = 2 // QoS 1
  
  // Variable header
  const msgIdBytes = new Uint8Array([messageId >> 8, messageId & 0xFF])
  
  // Payload
  const encodedTopic = encodeString(topic)
  const qos = new Uint8Array([0]) // QoS 0
  
  // Calculate remaining length
  const remainingLength = 2 + encodedTopic.length + 1
  const remainingLengthBytes = encodeLength(remainingLength)
  
  // Combine all parts
  return new Uint8Array([
    (type << 4) | flags,
    ...remainingLengthBytes,
    ...msgIdBytes,
    ...encodedTopic,
    ...qos
  ])
}

export function useMQTT(callback) {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const client = new WebSocket('wss://broker.mqttgo.io:8084/mqtt')
  client.binaryType = 'arraybuffer'

  client.onopen = () => {
    console.log('Connected to WebSocket')
    
    // Send MQTT CONNECT packet
    const clientId = 'vue-dashboard-' + Math.random().toString(16).substr(2, 8)
    const connectPacket = encodeConnectPacket(clientId)
    client.send(connectPacket)
    console.log('Sent CONNECT packet')
  }

  client.onmessage = (event) => {
    const data = new Uint8Array(event.data)
    const type = (data[0] >> 4) & 0x0F
    
    console.log('Received packet type:', type)
    
    // Handle CONNACK (type = 2)
    if (type === 2) {
      console.log('Received CONNACK, sending SUBSCRIBE')
      const messageId = Math.floor(Math.random() * 65535)
      const subscribePacket = encodeSubscribePacket(messageId, 'powermeter/elec110')
      client.send(subscribePacket)
      return
    }
    
    // Handle PUBLISH (type = 3)
    if (type === 3) {
      // Extract topic length from bytes 2-3
      const topicLength = (data[2] << 8) | data[3]
      // Extract topic
      const topicBytes = data.slice(4, 4 + topicLength)
      const topic = new TextDecoder().decode(topicBytes)
      
      if (topic === 'powermeter/elec110') {
        // Extract payload after topic
        const payload = data.slice(4 + topicLength)
        try {
          const payloadStr = new TextDecoder().decode(payload)
          const payloadData = JSON.parse(payloadStr)
          callback(payloadData)
        } catch (e) {
          console.error('Error parsing payload:', e)
        }
      }
    }
  }

  client.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  client.onclose = (event) => {
    console.log('WebSocket connection closed:', event)
    
    if (!reconnectTimer && event.code !== 1000) {
      reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...')
        try {
          useMQTT(callback)
        } catch (error) {
          console.error('Reconnection failed:', error)
        }
      }, 5000)
    }
  }

  // Send periodic PINGREQ to keep connection alive
  const pingInterval = setInterval(() => {
    if (client.readyState === WebSocket.OPEN) {
      const pingPacket = new Uint8Array([0xC0, 0x00]) // PINGREQ packet
      client.send(pingPacket)
      console.log('Sent PINGREQ')
    } else {
      clearInterval(pingInterval)
    }
  }, 30000) // Send ping every 30 seconds

  return client
}
