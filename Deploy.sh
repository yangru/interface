#!/bin/bash
USER=zhujunxing
HOST=10.70.32.101
REMOTE_DIR=/home/zhujunxing/daizhaolin/
REMOTE_TO_DIR=/var/www/html/service_enter

DIR=$(cd $(dirname $0)/; pwd)

echo '#!/bin/bash' >> tmp.sh
echo 'DIR=$(cd $(dirname $0)/; pwd)' >> tmp.sh
echo 'TO='${REMOTE_TO_DIR} >> tmp.sh
echo 'tar -zxvf ${DIR}/tmp.tar.gz -C ${TO}/' >> tmp.sh
echo 'chown -R root.root ${TO}/*' >> tmp.sh
echo 'chmod -R 777 ${TO}/*' >> tmp.sh
echo 'rm -rf ${DIR}/tmp.tar.gz' >> tmp.sh
echo 'rm -rf ${DIR}/tmp.sh' >> tmp.sh

tar -zcvf ${DIR}/tmp.tar.gz --exclude=Deploy.sh --exclude=application/config -C ${DIR} *

scp ${DIR}/tmp.tar.gz ${DIR}/tmp.sh ${USER}@${HOST}:${REMOTE_DIR}

ssh -t ${USER}@${HOST} "'sudo sh "${REMOTE_DIR}tmp.sh"'"

rm -rf ${DIR}/tmp.tar.gz
rm -rf ${DIR}/tmp.sh
