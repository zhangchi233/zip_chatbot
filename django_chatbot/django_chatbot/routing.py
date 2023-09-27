from channels.routing import ProtocolTypeRouter
# the same as http request but receive socket request
application = ProtocolTypeRouter(
    {}
)