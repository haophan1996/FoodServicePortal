# Generated by Django 5.0.3 on 2024-03-21 03:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('businessSQL', '0003_alter_item_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Detail',
            fields=[
                ('detailid', models.AutoField(primary_key=True, serialize=False, verbose_name='#')),
                ('detailnote', models.TextField()),
                ('detailquality', models.IntegerField(verbose_name='Quanlity')),
                ('firm_price', models.DecimalField(decimal_places=2, max_digits=5)),
            ],
            options={
                'db_table': 'detail',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('orid', models.AutoField(primary_key=True, serialize=False)),
                ('ordate', models.DateField()),
                ('orpickup', models.CharField(max_length=50)),
                ('orextraprice', models.DecimalField(decimal_places=2, max_digits=5)),
                ('ispickup', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'orders',
                'managed': False,
            },
        ),
        migrations.AlterModelTable(
            name='item',
            table='item',
        ),
    ]