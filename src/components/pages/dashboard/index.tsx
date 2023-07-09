import { useConfig } from '@/components/ConfigProvider';
import DashboardFile from '@/components/file/DashboardFile';
import Stat from '@/components/Stat';
import type { Response } from '@/lib/api/response';
import useLogin from '@/lib/hooks/useLogin';
import { LoadingOverlay, Paper, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { IconDeviceSdCard, IconEyeFilled, IconFiles, IconLink, IconStarFilled } from '@tabler/icons-react';
import bytes from 'bytes';
import useSWR from 'swr';

export default function DashboardHome() {
  const { user } = useLogin();
  const config = useConfig();

  const { data: recent, isLoading: recentLoading } = useSWR<Response['/api/user/recent']>('/api/user/recent');
  const { data: stats, isLoading: statsLoading } = useSWR<Response['/api/user/stats']>('/api/user/stats');

  return (
    <>
      <Title order={1}>
        Welcome back, <b>{user?.username}</b>
      </Title>
      <Text size='sm' color='dimmed'>
        You have <b>{statsLoading ? '...' : stats?.filesUploaded}</b> files uploaded.
      </Text>

      <Title order={2} mt='md' mb='xs'>
        Recent files
      </Title>

      {recentLoading ? (
        <Paper withBorder p='md' radius='md' pos='relative' h={300}>
          <LoadingOverlay visible />
        </Paper>
      ) : (
        <SimpleGrid cols={3} spacing='md' breakpoints={[{ maxWidth: 'sm', cols: 1, spacing: 'sm' }]}>
          {recent!.map((file) => (
            <DashboardFile
              disableMediaPreview={config.website.disableMediaPreview}
              key={file.id}
              file={file}
            />
          ))}
        </SimpleGrid>
      )}

      <Title order={2} mt='md'>
        Stats
      </Title>
      <Text size='sm' color='dimmed' mb='xs'>
        These statistics are based on your uploads only.
      </Text>

      {statsLoading ? (
        <Paper withBorder p='md' radius='md' pos='relative' h={300}>
          <LoadingOverlay visible />
        </Paper>
      ) : (
        <>
          <SimpleGrid cols={4} spacing='md' breakpoints={[{ maxWidth: 'sm', cols: 1, spacing: 'sm' }]}>
            <Stat Icon={IconFiles} title='Files uploaded' value={stats!.filesUploaded} />
            <Stat Icon={IconStarFilled} title='Favorite files' value={stats!.favoriteFiles} />
            <Stat
              Icon={IconDeviceSdCard}
              title='Storage used'
              value={bytes(stats!.storageUsed, { unitSeparator: ' ' })}
            />
            <Stat
              Icon={IconDeviceSdCard}
              title='Average storage used'
              value={bytes(stats!.avgStorageUsed, { unitSeparator: ' ' })}
            />
            <Stat Icon={IconEyeFilled} title='File views' value={stats!.views} />
            <Stat Icon={IconEyeFilled} title='File average views' value={stats!.avgViews} />

            <Stat Icon={IconLink} title='Links created' value={stats!.urlsCreated} />
          </SimpleGrid>

          <Title order={3} mt='lg' mb='xs'>
            File types
          </Title>
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats!.sortTypeCount).map(([type, count]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}
