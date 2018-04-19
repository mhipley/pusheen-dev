<?php

if (!defined('ABSPATH')) exit;

if (!class_exists('ElfsightPluginUpdate')) {
    class ElfsightPluginUpdate {
        public $currentVersion;
        public $updateUrl;
        public $pluginSlug;
        public $slug;
        public $purchaseCode;

        function __construct($update_url, $current_version, $plugin_slug, $purchase_code) {
            $this->updateUrl = $update_url;
            $this->currentVersion = $current_version;
            $this->pluginSlug = $plugin_slug;
            $this->purchaseCode = $purchase_code;

            list($t1, $t2) = explode('/', $this->pluginSlug);
            $this->slug = str_replace('.php', '', $t2);

            add_filter('pre_set_site_transient_update_plugins', array(&$this, 'checkUpdate'));
            add_filter('plugins_api', array(&$this, 'checkInfo'), 10, 3);
        }

        public function checkUpdate($transient) {
            if (empty($transient->checked)) {
                return $transient;
            }

            $result = $this->getInfo('version');
            update_option(str_replace('-', '_', $this->slug) . '_last_check_datetime', time());

            if (is_object($result) && empty($result->error) && !empty($result->data) && version_compare($this->currentVersion, $result->data->version, '<')) {
                update_option(str_replace('-', '_', $this->slug) . '_latest_version', $result->data->version);
                $transient->response[$this->pluginSlug] = $result->data;
            }

            return $transient;
        }

        public function checkInfo($result, $action, $args) {
            $result = false;

            if (isset($args->slug) && $args->slug === $this->slug) {
                $info = $this->getInfo('info');

                if (is_object($info) && empty($info->error) && !empty($info->data)) {
                    if (!empty($info->data->sections)) {
                        $info->data->sections = (array)$info->data->sections;
                    }

                    $result = $info->data;
                }
            }

            return $result;
        }

        public function getInfo($action) {
            $request_string = array(
                'body' => array(
                    'action' => urlencode($action),
                    'slug' => urlencode($this->slug),
                    'purchase_code' => urlencode($this->purchaseCode),
                    'version' => urlencode($this->currentVersion),
                    'host' => !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : get_site_url()
                )
            );

            $result = false;

            $response = wp_remote_post($this->updateUrl, $request_string);

            if (!is_wp_error($response) || wp_remote_retrieve_response_code($response) === 200) {
                if ($response_body = json_decode(wp_remote_retrieve_body($response))) {
                    $result = $response_body;
                }
            }

            return $result;
        }
    }
}