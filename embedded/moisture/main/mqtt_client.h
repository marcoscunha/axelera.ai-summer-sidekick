
#include "lwip/apps/mqtt.h"

void mqtt_do_connect(mqtt_client_t *client, char *broker_ip);
void mqtt_client_publish(mqtt_client_t *client, const char *topic, const char *pub_payload, void *arg);
void mqtt_health_check(mqtt_client_t *client);
