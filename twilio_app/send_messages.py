from twilio.rest import Client

account_sid = 'ACa2ec2ee2802cf26776a0e26413dc45e7'
auth_token = ''
client = Client(account_sid, auth_token)

message = client.messages.create(
  from_='whatsapp:+14155238886',
  content_sid='HX191f63c7c885054ff422dbcf060bfcdc',
  to='whatsapp:+573135906831'
)

print(message.sid)