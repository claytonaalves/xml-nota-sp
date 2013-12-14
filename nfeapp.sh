#!/bin/bash
#
# Service script for NFe App.
#
# chkconfig: 345 80 20
# description: NFe App
# processname: nfeapp
# pidfile: /var/run/nfeapp.pid
# logfile: /var/log/nfeapp.log
#
 
# Source function library.
. /etc/init.d/functions
 
NAME=nfeapp
SOURCE_DIR=/path/to/my/application/package/scripts
SOURCE_FILE=start.js
 
user=node
pidfile=/var/run/$NAME.pid
logfile=/var/log/$NAME.log
forever_dir=/var/run/forever
 
node=node
forever=forever
sed=sed
 
export PATH=$PATH:/home/node/local/node/bin
export NODE_PATH=$NODE_PATH:/home/node/local/node/lib/node_modules
 
start() {
  echo -n "Starting $NAME node instance: "
 
  if [ "$foreverid" == "" ]; then
    # Create the log and pid files, making sure that 
    # the target use has access to them
    touch $logfile
    chown $user $logfile
 
    touch $pidfile
    chown $user $pidfile
 
    # Launch the application
    daemon --user=root \
      $forever start -p $forever_dir --pidfile $pidfile -l $logfile \
      -a -d $SOURCE_DIR $SOURCE_FILE
    RETVAL=$?
  else
    echo "Instance already running"
    RETVAL=0
  fi
}
 
stop() {
  echo -n "Shutting down $NAME node instance : "
  if [ "$foreverid" != "" ]; then
    $node $SOURCE_DIR/prepareForStop.js
    $forever stop -p $forever_dir $id
  else
    echo "Instance is not running";
  fi
  RETVAL=$?
}
 
if [ -f $pidfile ]; then
  read pid < $pidfile
else
  pid = ""
fi
 
if [ "$pid" != "" ]; then
  # Gnarly sed usage to obtain the foreverid.
  sed1="/$pid\]/p"
  sed2="s/.*\[\([0-9]\+\)\].*\s$pid\].*/\1/g"
  foreverid=`$forever list -p $forever_dir | $sed -n $sed1 | $sed $sed2`
else
  foreverid=""
fi
 
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    status -p ${pidfile}
    ;;
  *)
    echo "Usage:  {start|stop|status}"
    exit 1
    ;;
esac
exit $RETVAL



