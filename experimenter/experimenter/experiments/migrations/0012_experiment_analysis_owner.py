# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-06 20:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("experiments", "0011_auto_20180531_1604")]

    operations = [
        migrations.AddField(
            model_name="experiment",
            name="analysis_owner",
            field=models.CharField(blank=True, max_length=255, null=True),
        )
    ]