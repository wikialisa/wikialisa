# SPDX-License-Identifier: GPL-2.0
# Makefile for AXQ Blockchain Hardware-Integrated Subsystem

obj-m += axq.o
axq-y := axq_main.o axq_pok.o

# Đường dẫn kernel build cục bộ hoặc hệ thống
KDIR ?= /lib/modules/$(shell uname -r)/build
PWD  := $(shell pwd)

default:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
