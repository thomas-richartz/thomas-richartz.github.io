

container build -t thomas-richartz-app . 


container run \
  --mount type=bind,source=$PWD,target=/app \
  --mount type=volume,source=thomas_node_modules,target=/app/node_modules \
  -p 3000:3000 \
  thomas-richartz-app



# troublshooting

# container ls -aq                                   
# container rm -f $(container ls -aq)     





