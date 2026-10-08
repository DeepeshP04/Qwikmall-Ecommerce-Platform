import os
import redis

redis_client = redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)

# import redis

# redis_client = redis.Redis(
#     host="localhost",
#     port=6379,
#     db=0,
# )