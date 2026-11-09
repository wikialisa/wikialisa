// SPDX-License-Identifier: GPL-2.0
/*
 * axq_main.c - Linux Kernel Character Device & IOCTL Interface for AXQ
 * Wikialisa Core & AXQ Chain Subsystem
 */

#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>
#include <linux/slab.h>
#include "axq.h"

static int major_number;
static struct class *axq_class = NULL;
static struct device *axq_device = NULL;

static int axq_open(struct inode *inodep, struct file *filep) {
    return 0;
}

static int axq_release(struct inode *inodep, struct file *filep) {
    return 0;
}

static long axq_unlocked_ioctl(struct file *file, unsigned int cmd, unsigned long arg) {
    int ret = 0;

    switch (cmd) {
        case AXQ_IOCTL_MINE_BLOCK: {
            struct axq_mine_request req;
            if (copy_from_user(&req, (struct axq_mine_request __user *)arg, sizeof(req)))
                return -EFAULT;

            ret = axq_execute_pok_mining(&req);
            if (ret == 0) {
                if (copy_to_user((struct axq_mine_request __user *)arg, &req, sizeof(req)))
                    return -EFAULT;
            }
            break;
        }

        case AXQ_IOCTL_GET_STATUS: {
            struct axq_status_info info;
            axq_get_hardware_status(&info);
            if (copy_to_user((struct axq_status_info __user *)arg, &info, sizeof(info)))
                return -EFAULT;
            break;
        }

        default:
            ret = -ENOTTY;
            break;
    }

    return ret;
}

static const struct file_operations axq_fops = {
    .owner          = THIS_MODULE,
    .open           = axq_open,
    .release        = axq_release,
    .unlocked_ioctl = axq_unlocked_ioctl,
};

static int __init axq_driver_init(void) {
    pr_info("====================================================\n");
    pr_info(" AXQ: Khoi tao Kernel Subsystem v%s\n", AXQ_DRIVER_VERSION);
    pr_info(" AXQ: Phat trien boi Wikialisa Core Architecture Group\n");
    pr_info("====================================================\n");

    major_number = register_chrdev(0, AXQ_DEV_NAME, &axq_fops);
    if (major_number < 0) {
        pr_err("AXQ: Khong the dang ky Major Number (Loi: %d)\n", major_number);
        return major_number;
    }

    axq_class = class_create(AXQ_CLASS_NAME);
    if (IS_ERR(axq_class)) {
        unregister_chrdev(major_number, AXQ_DEV_NAME);
        pr_err("AXQ: Khong the tao Device Class\n");
        return PTR_ERR(axq_class);
    }

    axq_device = device_create(axq_class, NULL, MKDEV(major_number, 0), NULL, AXQ_DEV_NAME);
    if (IS_ERR(axq_device)) {
        class_destroy(axq_class);
        unregister_chrdev(major_number, AXQ_DEV_NAME);
        pr_err("AXQ: Khong the tao Device Node /dev/%s\n", AXQ_DEV_NAME);
        return PTR_ERR(axq_device);
    }

    pr_info("AXQ: [READY] Thiet bi ky tu /dev/%s san sang phuc vu!\n", AXQ_DEV_NAME);
    return 0;
}

static void __exit axq_driver_exit(void) {
    device_destroy(axq_class, MKDEV(major_number, 0));
    class_unregister(axq_class);
    class_destroy(axq_class);
    unregister_chrdev(major_number, AXQ_DEV_NAME);
    pr_info("AXQ: Subsystem da duoc go bo an toan khoi Kernel.\n");
}

module_init(axq_driver_init);
module_exit(axq_driver_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Wikialisa Core Team");
MODULE_DESCRIPTION("Hardware-Integrated AXQ Blockchain Subsystem & PoK Engine");
MODULE_VERSION(AXQ_DRIVER_VERSION);
