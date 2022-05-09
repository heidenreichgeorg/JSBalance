# JSBalance

## Setup AWS
- AWS Instance starten
- Öffentliche IPv4-DNS kopieren
- SSH in Instance
`ssh -i "{PATH/TO/KEYPAIR.pem}" {User}@{Öffentliche IPv4-DNS}`


## Installieren bei einer neuen Instanz
```sh
sudo yum install git -y
git clone https://github.com/heidenreichgeorg/JSBalance.git
cd JSBalance
sh install.sh

# Version von git nach AWS schieben
git push origin master

## Starten
```sh
sh start.sh
```

---

## Stoppen
```sh
sh stop.sh
```

---

## Aktualisieren
```sh
sh update.sh
```


## Instance-Storage
sudo mkdir /opt/data
cd /opt
sudo umount /dev/xvda1
sudo mount /dev/xvda1 /opt/data
sudo mkdir /opt/data/HGKG
sudo chmod -R 664 data


## Pruefen, Mounten
lsblk -f
sudo mkdir /data
sudo mkdir /data/sessions
sudo mkdir /data/sessions/CLIENT




# lsblk
# sudo mkfs -t xfs /dev/xvda1
# sudo mount /dev/xvda1 /usr/etc


### den Code hat Tom gemacht
# ssh -i "C:\Users\Booking\AWS\AWS-KEYPAIR.pem" ec2-user@ec2-75-101-190-184.compute-1.amazonaws.com
# ssh -i "C:/Users/booking/AWS/AWS-KEYPAIR.pem" ec2-user@ec2-3-94-192-123.compute-1.amazonaws.com
